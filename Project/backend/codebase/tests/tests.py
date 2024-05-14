import unittest
from common import pdfHandler

class TestPdfHandler(unittest.TestCase):

    def test_chunking(self):
        #Arrange
        testfile = "tests/data/Automotive-SPICE-PAM-v40.pdf"
        #Act
        chunks = pdfHandler.proccess(testfile)
        #Assert
        self.assertIsNotNone(chunks)
        

if __name__ == '__main__':
    unittest.main()