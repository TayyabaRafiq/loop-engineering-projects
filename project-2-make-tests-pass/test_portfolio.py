from portfolio import get_name, get_title, get_skills


def test_name():
    assert get_name() == "Tayyaba Rafiq"


def test_title():
    assert get_title() == "AI Developer"


def test_skills():
    skills = get_skills()
    assert "Python" in skills
    assert "AI" in skills