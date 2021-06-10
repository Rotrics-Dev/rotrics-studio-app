import React from 'react';
import Taps from './taps/Index.jsx';
import NewVersionDetector from './../components/NewVersionDetector/Index.jsx'
import { actions as codeActions } from '../reducers/code'
import {connect} from 'react-redux';

class Index extends React.Component {
    actions = {
        /**
         * 2.补充 When item detected，参考官方的when I receive message 实现过程。定时监控下位机返回的字符串，当获取到对应字符串 为1，否则为0
         */
        // test: () => {
        //     // this.props.test()

        //     // console.log(window.broadcast_serial_port_receive)
        //     // window.broadcast_serial_port_receive('rng')
        // }
    }

    render() {
        return (
            <div>
                <Taps/>
                <NewVersionDetector/>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        test: () => {
            dispatch(codeActions.test())
        }
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index);

// export default Index;
