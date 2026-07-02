import re
from mat3ra.utils.regex import (
    convert_js_flags_to_python,
    regex_search,
    regex_search_by_schema,
)

# --- Tests for convert_js_flags_to_python ---

def test_convert_js_flags_to_python_single():
    assert convert_js_flags_to_python("i") == re.IGNORECASE
    assert convert_js_flags_to_python("m") == re.MULTILINE
    assert convert_js_flags_to_python("s") == re.DOTALL

def test_convert_js_flags_to_python_multiple():
    expected_flags = re.IGNORECASE | re.MULTILINE | re.DOTALL
    assert convert_js_flags_to_python("ims") == expected_flags

def test_convert_js_flags_to_python_unsupported():
    assert convert_js_flags_to_python("g") == 0
    assert convert_js_flags_to_python("ig") == re.IGNORECASE


# --- Tests for regex_search ---

def test_regex_search_single_match():
    content = "The quick brown fox jumps over the lazy dog."
    pattern = r"fox"
    match = regex_search(content, pattern)
    assert match is not None
    assert match.group(0) == "fox"

def test_regex_search_no_match():
    content = "The quick brown fox jumps over the lazy dog."
    pattern = r"cat"
    match = regex_search(content, pattern)
    assert match is None

def test_regex_search_find_all():
    content = "apple banana apple cherry apple"
    pattern = r"apple"
    matches = regex_search(content, pattern, find_all=True)

    assert hasattr(matches, '__iter__')
    matches_list = list(matches)
    assert len(matches_list) == 3
    assert all(m.group(0) == "apple" for m in matches_list)

def test_regex_search_with_flags():
    content = "Hello World"
    pattern = r"world"

    assert regex_search(content, pattern) is None
    match = regex_search(content, pattern, flags=re.IGNORECASE)
    assert match is not None
    assert match.group(0) == "World"

def test_regex_search_compiled_pattern():
    content = "Number is 12345."
    pattern = re.compile(r"\d+")
    match = regex_search(content, pattern)
    assert match is not None
    assert match.group(0) == "12345"


# --- Tests for regex_search_by_schema ---

def test_regex_search_by_schema_with_flags():
    content = "&SYSTEM foo bar /"
    schema = {
        "regex": r"&system\s*([\s\S]*?)\/",
        "flags": ["i"]
    }
    match = regex_search_by_schema(content, schema)
    assert match is not None
    assert match.group(0) == "&SYSTEM foo bar /"
    assert match.group(1).strip() == "foo bar"

def test_regex_search_by_schema_no_flags():
    content = "Test content"
    schema = {
        "regex": r"Test"
    }
    match = regex_search_by_schema(content, schema)
    assert match is not None
    assert match.group(0) == "Test"
