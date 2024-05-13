from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader

def readTestData(file):
    fileContent = []
    fileContent.append('')

    f = open(file, "r")
    page = 0
    for line in f:
        if 'PUBLIC' in line:
            page += 1
            fileContent.append('')
        else:
            fileContent[page] += line
    f.close()

    return fileContent

def combineData(data):
    allData = ''
    for page in data:
        allData += page
    return allData

def splitWithLongChain(data):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_text(data)

    return splits

def allInOne():
    loader = PyPDFLoader('testData/Automotive-SPICE-PAM-v40.pdf')
    docs = loader.load()

    #splits text into chunks including metadata for mapping from chunk to pdf page (splits[0].metadata['page'])
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)

    return splits

if __name__ == '__main__':
    data = readTestData('testData/Automotive-SPICE-PAM-v40.txt')
    data = combineData(data)
    chunks = splitWithLongChain(data)
    #print(len(chunks))
    print(len(allInOne()))
    #print(chunks[10])
    #print('------------------------------------')
    #print(chunks[11])
    #print('------------------------------------')
    #print(chunks[12])
