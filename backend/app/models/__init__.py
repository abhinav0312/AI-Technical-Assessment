from app.db.base import Base
from app.models.user import User
from app.models.profile import UserProfile
from app.models.challenge import (
    Challenge,
    ChallengeTag,
    ProgrammingLanguage,
    challenge_tag_association,
)
from app.models.assessment import Assessment, AssessmentAttempt
from app.models.submission import Submission, SubmissionTestCaseResult
from app.models.activity import UserActivity
from app.models.test_case import TestCase
from app.models.bookmark import ChallengeBookmark
from app.models.code_draft import CodeDraft
from app.models.thinktrace import (
    ReasoningRecord,
    ReasoningRecordVersion,
    ThinkTraceReport,
)
from app.models.codetwin import (
    Skill,
    ChallengeSkillAssociation,
    UserSkillProficiency,
    SkillEvidence,
    ErrorPatternDetection,
    PersonalizedRecommendation,
    LearningPlan,
    LearningPlanItem,
    SkillGraphVersion,
)
from app.models.bughunter import (
    BugHunterChallenge,
    BugHunterSubmission,
    BugHunterStreak,
    BugHunterBadge,
)
from app.models.devsim import (
    DevSimScenario,
    DevSimAttempt,
    DevSimReport,
)

__all__ = [
    "Base",
    "User",
    "UserProfile",
    "Challenge",
    "ChallengeTag",
    "ProgrammingLanguage",
    "challenge_tag_association",
    "Assessment",
    "AssessmentAttempt",
    "Submission",
    "SubmissionTestCaseResult",
    "UserActivity",
    "TestCase",
    "ChallengeBookmark",
    "CodeDraft",
    "ReasoningRecord",
    "ReasoningRecordVersion",
    "ThinkTraceReport",
    "Skill",
    "ChallengeSkillAssociation",
    "UserSkillProficiency",
    "SkillEvidence",
    "ErrorPatternDetection",
    "PersonalizedRecommendation",
    "LearningPlan",
    "LearningPlanItem",
    "SkillGraphVersion",
    "BugHunterChallenge",
    "BugHunterSubmission",
    "BugHunterStreak",
    "BugHunterBadge",
    "DevSimScenario",
    "DevSimAttempt",
    "DevSimReport",
]
