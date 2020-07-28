import React, {PureComponent} from 'react';
import ReactTooltip from "react-tooltip";

class Index extends PureComponent {
    getContent(dataTip) {
        //TODO: 文字太长的时候，插入<br>实现换行
        //https://github.com/wwayne/react-tooltip#readme
        return dataTip
    }

    render() {
        const {...rest} = this.props;
        return (
            <ReactTooltip
                type="info"
                effect="solid"
                backgroundColor="#c0c0c0"
                textColor="#292421"
                multiline={true}
                getContent={this.getContent}
                delayShow={200}
                {...rest}/>
        );
    }
}

export default Index;
