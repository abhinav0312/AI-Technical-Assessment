import pytest
from app.services.evaluator.runner import SubprocessRunner
from app.services.evaluator.comparator import normalize_output


@pytest.mark.asyncio
async def test_c_code_compilation_and_execution():
    c_code = """#include <stdio.h>
int main() {
    int a, b;
    if (scanf("%d %d", &a, &b) == 2) {
        printf("%d\\n", a + b);
    }
    return 0;
}
"""
    res = await SubprocessRunner.execute_code("c", c_code, "14 28\n", timeout_seconds=4.0)
    assert res.exit_code == 0
    assert not res.is_timed_out
    assert normalize_output(res.stdout) == "42"


@pytest.mark.asyncio
async def test_cpp_code_compilation_and_execution():
    cpp_code = """#include <iostream>
using namespace std;
int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << (a * b) << endl;
    }
    return 0;
}
"""
    res = await SubprocessRunner.execute_code("cpp", cpp_code, "6 7\n", timeout_seconds=4.0)
    assert res.exit_code == 0
    assert not res.is_timed_out
    assert normalize_output(res.stdout) == "42"


@pytest.mark.asyncio
async def test_cpp_compilation_error():
    broken_cpp = """#include <iostream>
int main() {
    this_is_an_undeclared_variable = 10;
    return 0;
}
"""
    res = await SubprocessRunner.execute_code("cpp", broken_cpp, "", timeout_seconds=4.0)
    assert res.compilation_error is not None
    assert "error" in res.compilation_error.lower()

