import re
from typing import Optional, List, Tuple, Dict, Any
from sqlalchemy import select, func, or_, desc, asc, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.challenge import Challenge, ChallengeTag, challenge_tag_association
from app.models.test_case import TestCase
from app.models.bookmark import ChallengeBookmark
from app.models.code_draft import CodeDraft
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate
from app.schemas.test_case import TestCaseCreate, TestCaseUpdate


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


class ChallengeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, challenge_id: str, load_test_cases: bool = False) -> Optional[Challenge]:
        options = [selectinload(Challenge.tags)]
        if load_test_cases:
            options.append(selectinload(Challenge.test_cases))

        stmt = select(Challenge).options(*options).where(Challenge.id == challenge_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_slug(self, slug: str, load_test_cases: bool = False) -> Optional[Challenge]:
        options = [selectinload(Challenge.tags)]
        if load_test_cases:
            options.append(selectinload(Challenge.test_cases))

        stmt = select(Challenge).options(*options).where(Challenge.slug == slug)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_adjacent_challenges(self, current_created_at) -> Tuple[Optional[str], Optional[str]]:
        """Returns (prev_slug, next_slug) for ordered navigation."""
        prev_stmt = (
            select(Challenge.slug)
            .where(Challenge.visibility == "public", Challenge.created_at < current_created_at)
            .order_by(desc(Challenge.created_at))
            .limit(1)
        )
        next_stmt = (
            select(Challenge.slug)
            .where(Challenge.visibility == "public", Challenge.created_at > current_created_at)
            .order_by(asc(Challenge.created_at))
            .limit(1)
        )
        prev_res = await self.db.execute(prev_stmt)
        next_res = await self.db.execute(next_stmt)
        return prev_res.scalar_one_or_none(), next_res.scalar_one_or_none()

    async def list_challenges(
        self,
        search: Optional[str] = None,
        difficulty: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        language: Optional[str] = None,
        sort_by: Optional[str] = "newest",
        page: int = 1,
        page_size: int = 10,
        only_public: bool = True,
    ) -> Tuple[List[Challenge], int]:
        query = select(Challenge).options(selectinload(Challenge.tags))

        if only_public:
            query = query.where(Challenge.visibility == "public")

        if search:
            term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Challenge.title.ilike(term),
                    Challenge.description.ilike(term),
                    Challenge.category.ilike(term),
                )
            )

        if difficulty:
            query = query.where(Challenge.difficulty == difficulty.lower())

        if category and category.lower() != "all":
            query = query.where(Challenge.category.ilike(f"%{category.strip()}%"))

        if tag:
            query = (
                query.join(Challenge.tags)
                .where(ChallengeTag.slug == tag.lower())
            )

        if language and language.lower() != "all":
            # Search language in JSON column supported_languages
            query = query.where(Challenge.supported_languages.contains([language.lower()]))

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar_one()

        # Sorting logic
        diff_order = case(
            (Challenge.difficulty == "easy", 1),
            (Challenge.difficulty == "medium", 2),
            (Challenge.difficulty == "hard", 3),
            else_=4,
        )

        if sort_by == "oldest":
            query = query.order_by(asc(Challenge.created_at))
        elif sort_by == "title_asc":
            query = query.order_by(asc(Challenge.title))
        elif sort_by == "title_desc":
            query = query.order_by(desc(Challenge.title))
        elif sort_by == "difficulty_asc":
            query = query.order_by(asc(diff_order))
        elif sort_by == "difficulty_desc":
            query = query.order_by(desc(diff_order))
        else:  # default newest
            query = query.order_by(desc(Challenge.created_at))

        # Paginate
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = result.scalars().all()
        return list(items), total

    async def is_bookmarked(self, user_id: str, challenge_id: str) -> bool:
        stmt = (
            select(ChallengeBookmark.id)
            .where(ChallengeBookmark.user_id == user_id, ChallengeBookmark.challenge_id == challenge_id)
            .limit(1)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none() is not None

    async def toggle_bookmark(self, user_id: str, challenge_id: str) -> bool:
        stmt = select(ChallengeBookmark).where(
            ChallengeBookmark.user_id == user_id,
            ChallengeBookmark.challenge_id == challenge_id,
        )
        res = await self.db.execute(stmt)
        bookmark = res.scalar_one_or_none()
        if bookmark:
            await self.db.delete(bookmark)
            await self.db.commit()
            return False
        else:
            new_bm = ChallengeBookmark(user_id=user_id, challenge_id=challenge_id)
            self.db.add(new_bm)
            await self.db.commit()
            return True

    async def get_draft(self, user_id: str, challenge_id: str, language: str) -> Optional[CodeDraft]:
        stmt = select(CodeDraft).where(
            CodeDraft.user_id == user_id,
            CodeDraft.challenge_id == challenge_id,
            CodeDraft.language == language,
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def save_draft(self, user_id: str, challenge_id: str, language: str, code: str) -> CodeDraft:
        draft = await self.get_draft(user_id, challenge_id, language)
        if draft:
            draft.code = code
        else:
            draft = CodeDraft(
                user_id=user_id,
                challenge_id=challenge_id,
                language=language,
                code=code,
            )
            self.db.add(draft)
        await self.db.commit()
        await self.db.refresh(draft)
        return draft

    # Test Case Management
    async def get_test_cases(self, challenge_id: str, only_samples: bool = False) -> List[TestCase]:
        query = select(TestCase).where(TestCase.challenge_id == challenge_id)
        if only_samples:
            query = query.where(TestCase.is_sample == True)
        query = query.order_by(TestCase.order_index)
        res = await self.db.execute(query)
        return list(res.scalars().all())

    async def create_test_case(self, challenge_id: str, tc_in: TestCaseCreate) -> TestCase:
        tc = TestCase(
            challenge_id=challenge_id,
            stdin=tc_in.stdin,
            expected_output=tc_in.expected_output,
            is_sample=tc_in.is_sample,
            description=tc_in.description,
            weight=tc_in.weight,
            order_index=tc_in.order_index,
        )
        self.db.add(tc)
        await self.db.commit()
        await self.db.refresh(tc)
        return tc

    async def update_test_case(self, tc: TestCase, tc_in: TestCaseUpdate) -> TestCase:
        if tc_in.stdin is not None:
            tc.stdin = tc_in.stdin
        if tc_in.expected_output is not None:
            tc.expected_output = tc_in.expected_output
        if tc_in.is_sample is not None:
            tc.is_sample = tc_in.is_sample
        if tc_in.description is not None:
            tc.description = tc_in.description
        if tc_in.weight is not None:
            tc.weight = tc_in.weight
        if tc_in.order_index is not None:
            tc.order_index = tc_in.order_index
        await self.db.commit()
        await self.db.refresh(tc)
        return tc

    async def delete_test_case(self, tc: TestCase):
        await self.db.delete(tc)
        await self.db.commit()

    async def create_challenge(self, challenge_in: ChallengeCreate) -> Challenge:
        slug = challenge_in.slug or slugify(challenge_in.title)
        existing = await self.get_by_slug(slug)
        if existing:
            slug = f"{slug}-{int(func.random() * 1000)}"

        challenge = Challenge(
            title=challenge_in.title,
            slug=slug,
            description=challenge_in.description,
            difficulty=challenge_in.difficulty,
            category=challenge_in.category,
            constraints=challenge_in.constraints,
            starter_code=challenge_in.starter_code or {},
            supported_languages=challenge_in.supported_languages,
            visibility=challenge_in.visibility,
        )

        if challenge_in.tags:
            for tag_name in challenge_in.tags:
                tag_slug = slugify(tag_name)
                tag_stmt = select(ChallengeTag).where(ChallengeTag.slug == tag_slug)
                tag_res = await self.db.execute(tag_stmt)
                tag_obj = tag_res.scalar_one_or_none()
                if not tag_obj:
                    tag_obj = ChallengeTag(name=tag_name.strip(), slug=tag_slug)
                    self.db.add(tag_obj)
                    await self.db.flush()
                challenge.tags.append(tag_obj)

        self.db.add(challenge)
        await self.db.commit()
        await self.db.refresh(challenge)
        return challenge

    async def update_challenge(self, challenge: Challenge, challenge_in: ChallengeUpdate) -> Challenge:
        if challenge_in.title is not None:
            challenge.title = challenge_in.title
        if challenge_in.description is not None:
            challenge.description = challenge_in.description
        if challenge_in.difficulty is not None:
            challenge.difficulty = challenge_in.difficulty
        if challenge_in.category is not None:
            challenge.category = challenge_in.category
        if challenge_in.constraints is not None:
            challenge.constraints = challenge_in.constraints
        if challenge_in.starter_code is not None:
            challenge.starter_code = challenge_in.starter_code
        if challenge_in.supported_languages is not None:
            challenge.supported_languages = challenge_in.supported_languages
        if challenge_in.visibility is not None:
            challenge.visibility = challenge_in.visibility

        if challenge_in.tags is not None:
            challenge.tags.clear()
            for tag_name in challenge_in.tags:
                tag_slug = slugify(tag_name)
                tag_stmt = select(ChallengeTag).where(ChallengeTag.slug == tag_slug)
                tag_res = await self.db.execute(tag_stmt)
                tag_obj = tag_res.scalar_one_or_none()
                if not tag_obj:
                    tag_obj = ChallengeTag(name=tag_name.strip(), slug=tag_slug)
                    self.db.add(tag_obj)
                    await self.db.flush()
                challenge.tags.append(tag_obj)

        await self.db.commit()
        await self.db.refresh(challenge)
        return challenge
