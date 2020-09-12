import React from 'react';
import ExampleProjects from "./ExampleProjects.jsx";
import MyProjects from "./MyProjects.jsx";

class Index extends React.Component {
    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <ExampleProjects/>
                <MyProjects/>
            </div>
        )
    }
}

export default Index;
