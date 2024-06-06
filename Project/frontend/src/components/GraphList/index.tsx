import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { GRAPH_LIST_API_PATH, GraphStatus } from '../../constant';

interface IGraphList {
    id: string;
    name: string;
    status: GraphStatus;
    location: string;
    created_at: string;
    updated_at: string | null;
}

const list: IGraphList[] = [
    {
        "created_at": "2024-06-06T18:43:42.399134+00:00",
        "name": "01. Robinson Crusoe author Daniel Defoew.pdf",
        "id": "d918c358-4cf1-49cf-badf-401126c55199",
        "location": "/usr/src/app/.media/documents/01. Robinson Crusoe author Daniel Defoew.pdf",
        "status": "document_uploaded" as GraphStatus,
        "updated_at": null
    }];

const getStatus = (status: GraphStatus) => {
    if (status === GraphStatus.DOC_UPLOADED) {
        return "Document uploaded";
    }
    return "Graph generated"
}

const getDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString();
}

const GraphList = () => {

    const [list, setList] = React.useState<IGraphList[]>([]);
    const [offset, setOffset] = React.useState<number>(0);
    const [limit, setLimit] = React.useState<number>(100);

    React.useEffect(() => {

        const API = `${import.meta.env.VITE_BACKEND_HOST}${GRAPH_LIST_API_PATH}?offset=${offset}&limit=${limit}`;
        fetch(API)
            .then((res) => res.json())
            .then((graphData: IGraphList[]) => {
                console.log(graphData)
                setList(graphData);
            })
            .catch((e) => console.log(e))

    }, [offset, limit]);

    return (
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                    <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Created at</TableCell>
                        <TableCell>Status</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {list.map((row) => (
                        <TableRow
                            key={row.name}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.name}
                            </TableCell>
                            <TableCell>{getDate(row.created_at)}</TableCell>
                            <TableCell>{getStatus(row.status)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default GraphList;