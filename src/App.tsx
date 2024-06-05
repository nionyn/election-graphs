import { useState, useMemo, useEffect } from "react";
import "./App.css";
import json from "./file.json";
import { ResponsiveContainer, LineChart, XAxis, YAxis, CartesianGrid, Line, Tooltip, Brush, Label } from "recharts";
import { Row, Col, Form, Stack } from "react-bootstrap";

const parties: object = {
    "CON": "blue", 
    "LAB": "red",
    "LD": "orange", 
    "PC/SNP": "yellow", 
    "Other": "grey"
};

const million = 1000000;
const single = 1;
const hundred = 100;

interface DropdownOptions {
    [key: string] : {
        unit: number;
        format?: Function;
    }
}

const options: DropdownOptions = {
    "Votes": {
        unit: million,
        format: (s:number) => (s / million).toString() + "m"
    },
    "Candidates": {
        unit: single,
    },
    "Seats": {
        unit: hundred,
    },
    "Vote Share": {
        unit: single,
        format: (s:number) => (s * 100).toString()
    }
};

const App = () => {

    const countries = Object.keys(json);
    const [country, setCountry] = useState<string>(countries[0]);
    const [data, setData] = useState<object[]>([]);
    const [option, setOption] = useState<string>(Object.keys(options)[0]);

    const [width, setWidth]   = useState(window.innerWidth);
    const [height, setHeight] = useState(window.innerHeight);
    const updateDimensions = () => {
        setWidth(window.innerWidth);
        setHeight(window.innerHeight);
    }
    useEffect(() => {
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, []);


    useEffect(() => {
        setData(Object.entries(json[country as keyof typeof json]).map(([k,v]) => ({Year: k, ...v})).sort((a,b) => a.Year.localeCompare(b.Year)));
    }, [country]);

    const getTickFormat = (t:number, _:any) : string => {
        const func = options[option as keyof typeof options].format;
        if (func instanceof Function){
            return func(t);
        } else {
            return t.toString();
        }
    };
    
    const getYearFormat = (t:number, _:any) : string => {
        const s = t.toString();
        return s.slice(2,s.length)
    };

    const Controls = () => <Stack direction="horizontal" gap={2}>
        <Form.Select value={country} onChange={c => setCountry(c.target.value)}>
                {countries.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </Form.Select>
        
        <Form.Select value={option} onChange={c => setOption(c.target.value)}>
                {Object.keys(options).map((c, i) => <option key={i} value={c}>{c}</option>)}
        </Form.Select>
    </Stack>

    const Graph = () => <ResponsiveContainer  width="100%" height={height - 80}>
        <LineChart className="bg-white" data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <Tooltip/>
            <XAxis dataKey="Year" tickFormatter={getYearFormat}>
                <Label value="Year" position="bottom" style={{textAnchor: "middle"}} />
            </XAxis>
            <YAxis  tickFormatter={getTickFormat}>
                <Label angle={-90} value={option} position="insideLeft" style={{textAnchor: "middle"}} />
            </YAxis>
            <CartesianGrid stroke="#eee" strokeDasharray="5 5"/>
            {Object.entries(parties).map(([party, colour])=> <Line type="monotone" dataKey={`${party}.${option}`} stroke={colour} />)}
        </LineChart>
    </ResponsiveContainer>

    return <Row className="p-0 m-0 justify-content-center">
        <Col xs={12} sm={12}>
            <Row className="m-2 justify-content-end">
                <Col>
                    <Controls/>
                </Col>
            </Row>
            <Row className="m-2 justify-content-center">
                <Col>
                    <Graph />
                </Col>
            </Row>
        </Col>
    </Row>
};

export default App;
