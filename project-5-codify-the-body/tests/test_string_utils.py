from string_utils import reverse_words


def test_reverse_words_three_words():
    assert reverse_words("a b c") == "c b a"


def test_reverse_words_single_word():
    assert reverse_words("hello") == "hello"
