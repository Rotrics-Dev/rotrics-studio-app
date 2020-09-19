import React from 'react';
import Taps from './taps/Index.jsx';
import NewVersionDetector from './../components/NewVersionDetector/Index.jsx'

class Index extends React.Component {
    render() {
        return (
            <div>
                <Taps/>
                <NewVersionDetector/>
            </div>
        )
    }
}

export default Index;
