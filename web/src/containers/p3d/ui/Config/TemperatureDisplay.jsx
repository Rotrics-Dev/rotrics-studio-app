import React from "react";
import { Row, Col } from 'antd'
import {actions as gcodeSendActions} from "../../../../reducers/gcodeSend";
import {connect} from 'react-redux';
import socketClientManager from "../../../../socket/socketClientManager";
import { TEMPERATURE_MONITOR } from "../../../../constants";
import {withTranslation} from 'react-i18next';

class TemperatureDisplay extends React.Component {
  state = {
    // 当前温度
    currentTemperature: '0.00',

    // 目标温度
    targetTemperature: '0.00',

    // 定时器
    timer: null
  }

  actions = {
    // 获取温度
    getTemperature: () => {
      this.props.startTask('M105', false)
    }
  }

  componentDidMount() {
    console.log(this.props.tap)

    // 监听温度
    socketClientManager.addServerListener(
        TEMPERATURE_MONITOR, (temperature) => {
            console.log('获取温度')
            console.log(temperature) // ok T:-15.00 /0.00 @:0
            
            try {
              temperature = temperature.replace(/\s+/g, ''); // 删除所有空格 okT:-15.00/0.00@:0
              temperature = temperature.split(':')[1] // -15.00/0.00@
              temperature = temperature.replace('@', '') //  -15.00/0.00
              const res = temperature.split('/') || []
              this.setState({
                currentTemperature: res[0] || this.state.currentTemperature,
                targetTemperature: res[1] || this.state.targetTemperature
              })
            } catch (error) {
              console.log(error)
            }
        }
    );
  }

  componentDidUpdate () {
    const { timer } = this.state
    const { tap, path } = this.props

    // 移除温度监听计时器
    if (timer && (tap !== 'TAP_P3D' || !path)) {
      console.log('移除温度监听计时器')
      clearInterval(this.state.timer)
      this.setState({
        timer: null
      })

      return
    }

    // 注册监听计时器
    if (!timer && (tap === 'TAP_P3D' && path)) {
      console.log('注册温度监听计时器')
      this.setState({
        timer: setInterval(() => {
          this.actions.getTemperature()
        }, 2000)
      })
    }
  }

  render () {
    const { currentTemperature, targetTemperature } = this.state
    const { t } = this.props

    return (
      <div 
        style={{
          background: '#fff',
          border: '1px solid #d9d9d9',
          boxShadow: '0 2px 0 rgb(0 0 0 / 2%)'
        }}>
        <Row
          style={{
            height: '32px',
            padding: '0 16px 0 16px',
            boxSizing: 'border-box',
            borderBottom: '1px solid #d9d9d9'
          }}>
          <Col 
            span={10}
            style={{
              lineHeight: '32px'
            }}>
              <span>{t("Current Temperature")}</span>
          </Col>
          <Col 
            span={14}
            style={{
              lineHeight: '32px'
            }}>
              <div style={{ textAlign: 'right' }}>{`${currentTemperature}°C`}</div>
          </Col>
        </Row>
        <Row
          style={{
            height: '32px',
            padding: '0 16px 0 16px',
            boxSizing: 'border-box'
          }}>
            <Col 
              span={10}
              style={{
                lineHeight: '32px'
              }}>
                <span>{t("Target Temperature")}</span>
            </Col>
            <Col 
              span={14}
              style={{
                lineHeight: '32px'
              }}>
                <div style={{ textAlign: 'right' }}>{`${targetTemperature}°C`}</div>
            </Col>
        </Row>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { tap } = state.taps
  const { path } = state.serialPort
  return { tap, path };
};

const mapDispatchToProps = (dispatch) => {
  return {
      startTask: (gcode, isAckChange) => dispatch(gcodeSendActions.startTask(gcode, isAckChange))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(TemperatureDisplay));