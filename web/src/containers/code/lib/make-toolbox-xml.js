import ScratchBlocks from "rotrics-scratch-blocks";

const categorySeparator = '<sep gap="15"/>';

//颜色和rotrics-scratch-blocks/core/colours.js保持一致
const motion = function () {
    return `
    <category name="%{BKY_CATEGORY_MOTION}" id="motion" colour="#4C97FF" secondaryColour="#3373CC">
       <block type="RS_MOTION_SAY_HELLO"/>
       <block type="RS_MOTION_MOVE_HOME"/>
       <block type="RS_MOTION_MOVE_ORIGIN"/>
       <block type="RS_MOTION_MOVE_POSITION">
            <value name="VALUE1">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">350</field>
                </shadow>
            </value>
            <value name="VALUE3">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_MOVE_RELATIVE">
            <value name="VALUE1">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">0</field>
                </shadow>
            </value>
            <value name="VALUE3">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_MOVE_RECTANGLE">
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">40</field>
                </shadow>
            </value>
            <value name="VALUE3">
                <shadow type="math_number">
                    <field name="NUM">20</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_MOVE_CIRCLE">
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_ROTATE_WRIST">
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">45</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_ROTATE_WRIST_TO">
            <value name="VALUE1">
                <shadow type="math_number">
                    <field name="NUM">15</field>
                </shadow>
            </value>
       </block>
       <block type="RS_MOTION_KEEP_ROTATE">
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
       </block>
       ${categorySeparator}
    </category>
    `;
};

const frontEnd = function () {
    /**
     * <block type="RS_ROTARY_FRONT_END_AIR_PICKER"/>
        <block type="RS_ROTARY_FRONT_END_SOFT_GRIPPER"/>
     */
    return `
    <category name="%{BKY_CATEGORY_RS_FRONT_END}" id="front_end" colour="#6F53F4" secondaryColour="#583FF3">
        <block type="RS_FRONT_END_AIR_PICKER"/>
        <block type="RS_FRONT_END_SOFT_GRIPPER"/>
        ${categorySeparator}
    </category>
    `;
};

const settings = function () {
    return `
    <category name="%{BKY_CATEGORY_RS_SETTINGS}" id="settings" colour="#8E66BC" secondaryColour="#7D51B1">
        <block type="RS_SETTINGS_SELECT_FRONT_END"/>
        <block type="RS_SETTINGS_SET_SPEED">
            <value name="VALUE1">
                <shadow type="math_number">
                    <field name="NUM">1000</field>
                </shadow>
            </value>
        </block>
        <block type="RS_SETTINGS_SET_ACCELERATION">
            <value name="VALUE2">
                <shadow type="math_number">
                    <field name="NUM">200</field>
                </shadow>
            </value>
        </block>
        <block type="RS_SETTINGS_SET_MOTION_MODE"/>
        <block type="RS_SETTINGS_SET_WORK_ORIGIN"/>
        ${categorySeparator}
    </category>
    `;
};

// - 补充 When item detected，参考官方的when I receive message 实现过程。定时监控下位机返回的字符串，当获取到对应字符串 为1，否则为0.
const events = function () {
    return `
    <category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="#FFD500" secondaryColour="#CC9900">
        <block type="event_whenflagclicked"/>
        <block type="event_whenkeypressed"/>
        <block type="event_whenbroadcastreceived">
        </block>
        <block type="event_broadcast">
            <value name="BROADCAST_INPUT">
                <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        <block type="event_broadcastandwait">
            <value name="BROADCAST_INPUT">
              <shadow type="event_broadcast_menu"></shadow>
            </value>
        </block>
        ${categorySeparator}
    </category>
    `;
};

const control = function () {
    return `
    <category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#FFAB19" secondaryColour="#CF8B17">
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
        </block>
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block id="forever" type="control_forever"/>
        <block type="control_if"/>
        <block type="control_if_else"/>
        <block id="wait_until" type="control_wait_until"/>
        <block id="repeat_until" type="control_repeat_until"/>
        <block type="control_stop"/>
        ${categorySeparator}
    </category>
    `;
};

const sensing = function () {
    return `
    <category name="%{BKY_CATEGORY_SENSING}" id="sensing" colour="#4CBFE6" secondaryColour="#2E8EB8">
        <block type="sensing_keypressed">
            <value name="KEY_OPTION">
                <shadow type="sensing_keyoptions"/>
            </value>
        </block>
        <block type="RS_SENSING_CURRENT_POSITION"/>
        <block type="RS_SENSING_CURRENT_ACCELERATION"/>
        ${categorySeparator}
    </category>
    `;
};

const sliding_rail = function () {
    return `
    <category name="%{BKY_CATEGORY_RS_SLIDING_RAIL}" id="sliding_rail" colour="#B551B3" secondaryColour="#AC44AB">
       <block type="RS_SLIDING_RAIL_MOVE">
            <value name="VALUE2">
                <shadow  type="math_number">
                    <field name="NUM">100</field>
                </shadow>
            </value>
            <value name="VALUE3">
                <shadow  type="math_number">
                    <field name="NUM">2000</field>
                </shadow>
            </value>
       </block>
       <block type="RS_SLIDING_RAIL_MOVE_TO_ORIGIN"/>
       ${categorySeparator}
    </category>
    `;
};

const conveyor_belt = function () {
    return `
    <category name="%{BKY_CATEGORY_RS_CONVEYOR_BELT}" id="conveyor_belt" colour="#FF7122" secondaryColour="#D2581A">
       <block type="RS_CONVEYOR_BELT_MOVE">
            <value name="VALUE2">
                <shadow  type="math_number">
                    <field name="NUM">5000</field>
                </shadow>
            </value>
       </block>
        <block type="RS_CONVEYOR_BELT_STOP"/>
        ${categorySeparator}
    </category>
    `;
};

const operators = function () {
    const apple = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_APPLE', 'apple');
    const banana = ScratchBlocks.ScratchMsgs.translate('OPERATORS_JOIN_BANANA', 'banana');
    const letter = ScratchBlocks.ScratchMsgs.translate('OPERATORS_LETTEROF_APPLE', 'a');
    return `
    <category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#40BF4A" secondaryColour="#389438">
        <block type="operator_add">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_subtract">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_multiply">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_divide">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_random">
            <value name="FROM">
                <shadow type="math_number">
                    <field name="NUM">1</field>
                </shadow>
            </value>
            <value name="TO">
                <shadow type="math_number">
                    <field name="NUM">10</field>
                </shadow>
            </value>
        </block>
        <block type="operator_gt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_lt">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_equals">
            <value name="OPERAND1">
                <shadow type="text">
                    <field name="TEXT"/>
                </shadow>
            </value>
            <value name="OPERAND2">
                <shadow type="text">
                    <field name="TEXT">50</field>
                </shadow>
            </value>
        </block>
        <block type="operator_and"/>
        <block type="operator_or"/>
        <block type="operator_not"/>
        <block type="operator_mod">
            <value name="NUM1">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
            <value name="NUM2">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_round">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_mathop">
            <value name="NUM">
                <shadow type="math_number">
                    <field name="NUM"/>
                </shadow>
            </value>
        </block>
        <block type="operator_join">
                <value name="STRING1">
                    <shadow type="text">
                        <field name="TEXT">${apple} </field>
                    </shadow>
                </value>
                <value name="STRING2">
                    <shadow type="text">
                        <field name="TEXT">${banana}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_letter_of">
                <value name="LETTER">
                    <shadow type="math_whole_number">
                        <field name="NUM">1</field>
                    </shadow>
                </value>
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_length">
                <value name="STRING">
                    <shadow type="text">
                        <field name="TEXT">${apple}</field>
                    </shadow>
                </value>
            </block>
            <block type="operator_contains" id="operator_contains">
              <value name="STRING1">
                <shadow type="text">
                  <field name="TEXT">${apple}</field>
                </shadow>
              </value>
              <value name="STRING2">
                <shadow type="text">
                  <field name="TEXT">${letter}</field>
                </shadow>
              </value>
            </block>
        ${categorySeparator}
    </category>
    `;
};

const variables = function () {
    return `
    <category
        name="%{BKY_CATEGORY_VARIABLES}"
        id="variables"
        colour="#FF8C1A"
        secondaryColour="#DB6E00"
        custom="VARIABLE">
    </category>
    `;
};

const myBlocks = function () {
    return `
    <category
        name="%{BKY_CATEGORY_MYBLOCKS}"
        id="myBlocks"
        colour="#FF6680"
        secondaryColour="#FF4D6A"
        custom="PROCEDURE">
    </category>
    `;
};

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';

/**
 * @param {!boolean} isStage - Whether the toolbox is for a stage-type target.
 * @param {?string} targetId - The current editing target
 * @param {?Array.<object>} categoriesXML - optional array of `{id,xml}` for categories. This can include both core
 * and other extensions: core extensions will be placed in the normal Scratch order; others will go at the bottom.
 * @property {string} id - the extension / category ID.
 * @property {string} xml - the `<category>...</category>` XML for this extension / category.
 * @param {?string} costumeName - The name of the default selected costume dropdown.
 * @param {?string} backdropName - The name of the default selected backdrop dropdown.
 * @param {?string} soundName -  The name of the default selected sound dropdown.
 * @returns {string} - a ScratchBlocks-style XML document for the contents of the toolbox.
 */
const makeToolboxXML = function (isInitialSetup, isStage, targetId, categoriesXML = [], costumeName = '', backdropName = '', soundName = '') {
    const gap = [categorySeparator];

    categoriesXML = categoriesXML.slice();
    const moveCategory = categoryId => {
        const index = categoriesXML.findIndex(categoryInfo => categoryInfo.id === categoryId);
        if (index >= 0) {
            // remove the category from categoriesXML and return its XML
            const [categoryInfo] = categoriesXML.splice(index, 1);
            return categoryInfo.xml;
        }
        // return `undefined`
    };
    const frontEndXML = moveCategory('front_end') || frontEnd(isStage, targetId);
    const settingsXML = moveCategory('settings') || settings(isStage, targetId);
    const motionXML = moveCategory('motion') || motion(isStage, targetId);
    const eventsXML = moveCategory('event') || events(isStage, targetId);
    const controlXML = moveCategory('control') || control(isStage, targetId);
    const sensingXML = moveCategory('sensing') || sensing(isStage, targetId);
    const operatorsXML = moveCategory('operators') || operators(isStage, targetId);
    const variablesXML = moveCategory('data') || variables(isStage, targetId);
    const myBlocksXML = moveCategory('procedures') || myBlocks(isInitialSetup, isStage, targetId);

    //TODO: 弄明白代码
    const everything = [
        xmlOpen,
        motionXML, gap,
        frontEndXML, gap,
        settingsXML, gap,
        sliding_rail, gap,
        conveyor_belt, gap,
        eventsXML, gap,
        controlXML, gap,
        sensingXML, gap,
        operatorsXML, gap,
        variablesXML,
        // myBlocksXML
    ];

    for (const extensionCategory of categoriesXML) {
        everything.push(gap, extensionCategory.xml);
    }

    everything.push(xmlClose);
    return everything.join('\n');
};

export default makeToolboxXML;
