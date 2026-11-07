import re
from typing import Tuple


def normalize_output(text: str) -> str:
    """
    Normalizes program output for deterministic comparison:
    - Normalizes line endings (CRLF -> LF)
    - Trims trailing whitespace on each line
    - Strips leading and trailing blank lines
    """
    if text is None:
        return ""
    # Standardize line breaks
    normalized = text.replace("\r\n", "\n").replace("\r", "\n")
    # Strip trailing whitespace on each line
    lines = [line.rstrip() for line in normalized.split("\n")]
    # Strip empty trailing lines
    while lines and not lines[-1]:
        lines.pop()
    # Strip empty leading lines
    while lines and not lines[0]:
        lines.pop(0)
    return "\n".join(lines)


def compare_outputs(actual: str, expected: str) -> Tuple[bool, str, str]:
    """
    Returns (is_match, normalized_actual, normalized_expected)
    """
    norm_actual = normalize_output(actual)
    norm_expected = normalize_output(expected)
    is_match = norm_actual == norm_expected
    return is_match, norm_actual, norm_expected
