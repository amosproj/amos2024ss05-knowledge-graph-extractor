import pytest
from graphCreator import pdfHandler

def test_chunking():
    #Arrange
    testfile = "tests/data/Automotive-SPICE-PAM-v40_p1-3.pdf"
    #Act
    chunks = pdfHandler.proccess(testfile)
    #Assert
    assert chunks != None