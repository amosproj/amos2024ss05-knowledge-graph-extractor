from graphCreator import pdfHandler


def test_chunking():
    """
    Tests if the text chunk extraction from a test pdf is successful
    """
    # Arrange
    testfile = "tests/data/Automotive-SPICE-PAM-v40_p1-3.pdf"
    # Act
    chunks = pdfHandler.proccess(testfile)
    # Assert
    assert chunks is not None
