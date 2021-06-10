import React, {PureComponent} from 'react';
import ReactTooltip from "react-tooltip";
import styles from './styles.css';
import {connect} from 'react-redux';

//https://stackoverflow.com/questions/57803271/displaying-text-on-multiple-lines-in-react-tooltip
class Index extends PureComponent {
    // getContent(dataTip) {
    //     if (dataTip) {
    //         dataTip = dataTip.trim();
    //         if (dataTip.charAt(dataTip.length - 1) === "。") {
    //             dataTip = dataTip.substr(0, dataTip.length - 1)
    //         }
    //     }
    //     return dataTip;
    // }

    render() {
        const {...rest} = this.props;
        const {isTooltipDisplayed} = this.props;
        return (
            <ReactTooltip
                className={styles.style_default}
                offset={{left: 5}}
                type="info"
                effect="solid"
                backgroundColor="#c0c0c0"
                textColor="#292421"
                multiline={true}
                // getContent={this.getContent}
                delayShow={200}
                html={true}
                disable={!isTooltipDisplayed}
                {...rest}/>
        );
    }
}


const mapStateToProps = (state) => {
    const {isTooltipDisplayed} = state.persistentData;
    return {
        isTooltipDisplayed
    };
};

export default connect(mapStateToProps)((Index));


