import re
from typing import Optional, List, Tuple
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.challenge import Challenge, ChallengeTag, challenge_tag_association
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


class ChallengeRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, challenge_id: str) -> Optional[Challenge]:
        stmt = (
            select(Challenge)
            .options(selectinload(Challenge.tags))
            .where(Challenge.id == challenge_id)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_slug(self, slug: str) -> Optional[Challenge]:
        stmt = (
            select(Challenge)
            .options(selectinload(Challenge.tags))
            .where(Challenge.slug == slug)
        )
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_challenges(
        self,
        search: Optional[str] = None,
        difficulty: Optional[str] = None,
        category: Optional[str] = None,
        tag: Optional[str] = None,
        page: int = 1,
        page_size: int = 10,
        only_public: bool = True,
    ) -> Tuple[List[Challenge], int]:
        query = select(Challenge).options(selectinload(Challenge.tags))

        if only_public:
            query = query.where(Challenge.visibility == "public")

        if search:
            search_term = f"%{search.strip()}%"
            query = query.where(
                or_(
                    Challenge.title.ilike(search_term),
                    Challenge.description.ilike(search_term),
                    Challenge.category.ilike(search_term),
                )
            )

        if difficulty:
            query = query.where(Challenge.difficulty == difficulty.lower())

        if category:
            query = query.where(Challenge.category.ilike(f"%{category.strip()}%"))

        if tag:
            query = (
                query.join(Challenge.tags)
                .where(ChallengeTag.slug == tag.lower())
            )

        # Count total
        count_stmt = select(func.count()).select_from(query.subquery())
        count_res = await self.db.execute(count_stmt)
        total = count_res.scalar_one()

        # Paginate
        offset = (page - 1) * page_size
        query = query.order_by(Challenge.created_at.desc()).offset(offset).limit(page_size)

        result = await self.db.execute(query)
        items = result.scalars().all()
        return list(items), total

    async def create_challenge(self, challenge_in: ChallengeCreate) -> Challenge:
        slug = challenge_in.slug or slugify(challenge_in.title)
        
        # Ensure unique slug
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

        # Handle tags
        if challenge_in.tags:
            for tag_name in challenge_in.tags:
                tag_slug = slugify(tag_name)
                # find or create tag
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
