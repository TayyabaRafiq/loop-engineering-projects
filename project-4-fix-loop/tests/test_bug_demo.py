from bug_demo import average


def test_average_normal_numbers():
    assert average([10, 20, 30]) == 20


def test_average_empty_list():
    assert average([]) == 0