import React from 'react';
import {Button, Modal, Input, Row, Col} from 'antd';

//props: title, onOk, onCancel, defaultValue
class Index extends React.Component {
    state = {
        name: "",
    };

    componentDidMount() {
        this.setState({name: this.props.defaultValue})
    }

    actions = {
        changeName: (e) => {
            this.setState({name: e.target.value})
        }
    };

    render() {
        const state = this.state;
        const actions = this.actions;
        const {title, onOk, onCancel} = this.props;
        return (
            <Modal
                title={title}
                visible={true}
                onCancel={onCancel}
                footer={[
                    <Button
                        ghost
                        key="Cancel"
                        type="primary"
                        size="small"
                        onClick={onCancel}>
                        {"Cancel"}
                    </Button>,
                    <Button
                        ghost
                        key="Create"
                        type="primary"
                        size="small"
                        onClick={() => {
                            onOk(state.name)
                        }}>
                        {'OK'}
                    </Button>
                ]}
            >
                <Row>
                    <Col span={8}>
                        <span style={{float: "right", margin: "5px 10px 0 0"}}>{`${"Project Name"}:`}</span>
                    </Col>
                    <Col span={12}>
                        <Input
                            value={state.name}
                            allowClear={true} placeholder="input project name"
                            onChange={actions.changeName}/>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

export default Index;


