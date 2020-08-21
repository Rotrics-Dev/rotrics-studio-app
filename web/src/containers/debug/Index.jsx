import React from 'react';
import styles from './styles.less';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

class Index extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div style={{backgroundColor: "#ee000000", width: "400px"}} tabBarStyle={{width: "120px", backgroundColor: "ff0000"}}>
                <Tabs defaultActiveKey="1" centered={true}>
                    <TabPane tab="G-code" key="1">
                        Content of Tab Pane 1
                    </TabPane>
                    <TabPane tab="Control" key="2">
                        Content of Tab Pane 2
                    </TabPane>
                    <TabPane tab="Tab 3dasdsa" key="3">
                        Content of Tab Pane 3
                    </TabPane>
                </Tabs>
            </div>
        )
    }
}

export default (Index);

