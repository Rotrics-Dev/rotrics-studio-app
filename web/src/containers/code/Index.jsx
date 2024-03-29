import React from 'react';
import Workspace from "./ui/workspace/Index.jsx";
import ProjectsModal from "./ui/projects-modal/Index.jsx";
import Menu from "./ui/menu/Menu.jsx";
import styles from './styles.css';
class Index extends React.Component {
    render() {
        return (
            <div style={{width: "100%", height: "100%"}}>
                <div>123</div>
                {/* 顶部蓝色菜单 */}
                <div className={styles.div_menu}>
                    <Menu/>
                </div>
                {/* 工作区 */}
                <div className={styles.div_workspace}>
                    <Workspace />
                </div>
                <ProjectsModal/>
            </div>
        )
    }
}

export default Index;

