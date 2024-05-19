from graph_creator import pdf_handler


def test_chunking():
    """
    Tests if the text chunk extraction from a test pdf is successful
    """
    # Arrange
    testfile = "tests/data/Automotive-SPICE-PAM-v40_p1-3.pdf"
    # Act
    chunks = pdf_handler.process_pdf_into_chunks(testfile)
    # Assert
    assert chunks is not None
