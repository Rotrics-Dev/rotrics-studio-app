import React from 'react';
import showdown from 'showdown';
import checkUpdate from '../../utils/VersionUtils';
import {Modal} from 'antd';

class Index extends React.Component {
    state = {}

    componentDidMount() {
        checkUpdate((latestVersionData) => {
            this.setState({latestVersionData, showUpdate: true});
        });
    }

    render() {
        let info = '';
        const {showUpdate, latestVersionData} = this.state;
        if (showUpdate && latestVersionData && latestVersionData.infos.length > 0) {
            const converter = new showdown.Converter()
            info = converter.makeHtml(latestVersionData.infos[0].content);
        }
        return (
            <div>
                {this.state.showUpdate && <Modal
                    title={"New Version Rotrics Studio Is Available"}
                    visible={this.state.showUpdate}
                    onCancel={() => {
                        this.setState({showUpdate: false});
                    }}
                    onOk={() => {
                        this.setState({showUpdate: false});
                        window.open('https://www.rotrics.com/pages/download', '_blank');
                    }}>
                    <div dangerouslySetInnerHTML={{__html: info}}/>
                    <h3>Download the latest Rotrics Studio now?</h3>
                </Modal>}
            </div>
        );
    }
}

export default Index;
