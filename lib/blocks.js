/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Blocks for Blockly's Block Factory application.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

Blockly.Blocks['factory_base'] = {
  // Base of new block.
  init: function () {
    this.setColour(120);
    this.appendDummyInput()
      .appendField('积木名称')
      .appendField(new Blockly.FieldTextInput('名称'), 'NAME');
    this.appendStatementInput('INPUTS')
      .setCheck('Input')
      .appendField('输入');
    var dropdown = new Blockly.FieldDropdown([
      ['自动检测', 'AUTO'],
      ['多行模式', 'EXT'],
      ['单行模式', 'INT']]);
    this.appendDummyInput().appendField('输入模式')
      .appendField(dropdown, 'INLINE');
    
    dropdown = new Blockly.FieldDropdown([
        ['不连接', 'NONE'],
        ['← 向左边输出', 'LEFT'],
        ['↕ 上下连接', 'BOTH'],
        ['↑ 只向上连接', 'TOP'],
        ['↓ 只向下连接', 'BOTTOM']],
      function (option) {
        this.getSourceBlock().updateShape_(option);
        // Connect a shadow block to this new input.
        this.getSourceBlock().spawnOutputShadow_(option);
      });
    this.appendDummyInput()
      .appendField(dropdown, 'CONNECTIONS');
    this.appendValueInput('TOOLTIP')
      .setCheck('String')
      .appendField('悬停提示');
    this.appendValueInput('HELPURL')
      .setCheck('String')
      .appendField('帮助链接（可不填）');
    this.appendValueInput('COLOUR')
      .setCheck('Colour')
      .appendField('积木颜色');
    this.setTooltip('创建你的积木！');
  },
  mutationToDom: function () {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('connections', this.getFieldValue('CONNECTIONS'));
    return container;
  },
  domToMutation: function (xmlElement) {
    var connections = xmlElement.getAttribute('connections');
    this.updateShape_(connections);
  },
  spawnOutputShadow_: function (option) {
    // Helper method for deciding which type of outputs this block needs
    // to attach shadow blocks to.
    switch (option) {
      case 'LEFT':
        this.connectOutputShadow_('OUTPUTTYPE');
        break;
      case 'TOP':
        this.connectOutputShadow_('TOPTYPE');
        break;
      case 'BOTTOM':
        this.connectOutputShadow_('BOTTOMTYPE');
        break;
      case 'BOTH':
        this.connectOutputShadow_('TOPTYPE');
        this.connectOutputShadow_('BOTTOMTYPE');
        break;
    }
  },
  connectOutputShadow_: function (outputType) {
    // Helper method to create & connect shadow block.
    var type = this.workspace.newBlock('type_null');
    type.setShadow(true);
    type.outputConnection.connect(this.getInput(outputType).connection);
    type.initSvg();
    if (this.rendered) {
      type.render();
    }
  },
  updateShape_: function (option) {
    var outputExists = this.getInput('OUTPUTTYPE');
    var topExists = this.getInput('TOPTYPE');
    var bottomExists = this.getInput('BOTTOMTYPE');
    if (option == 'LEFT') {
      if (!outputExists) {
        this.addTypeInput_('OUTPUTTYPE', '输出数据类型');
      }
    } else if (outputExists) {
      this.removeInput('OUTPUTTYPE');
    }
    if (option == 'TOP' || option == 'BOTH') {
      if (!topExists) {
        this.addTypeInput_('TOPTYPE', '上方积木类型');
      }
    } else if (topExists) {
      this.removeInput('TOPTYPE');
    }
    if (option == 'BOTTOM' || option == 'BOTH') {
      if (!bottomExists) {
        this.addTypeInput_('BOTTOMTYPE', '下方积木类型');
      }
    } else if (bottomExists) {
      this.removeInput('BOTTOMTYPE');
    }
  },
  addTypeInput_: function (name, label) {
    this.appendValueInput(name)
      .setCheck('Type')
      .appendField(label);
    this.moveInputBefore(name, 'COLOUR');
  }
};

var FIELD_MESSAGE = '域 %1 %2';
var FIELD_ARGS = [
  {
    "type": "field_dropdown",
    "name": "ALIGN",
    "options": [['左边', 'LEFT'], ['右边', 'RIGHT'], ['居中', 'CENTRE']],
  },
  {
    "type": "input_statement",
    "name": "FIELDS",
    "check": "Field"
  }
];

var TYPE_MESSAGE = '类型 %1';
var TYPE_ARGS = [
  {
    "type": "input_value",
    "name": "TYPE",
    "check": "Type",
    "align": "RIGHT"
  }
];

Blockly.Blocks['input_value'] = {
  // Value input.
  init: function () {
    this.jsonInit({
      "message0": "输入 %1 %2",
      "args0": [
        {
          "type": "field_input",
          "name": "INPUTNAME",
          "text": "NAME"
        },
        {
          "type": "input_dummy"
        }
      ],
      "message1": FIELD_MESSAGE,
      "args1": FIELD_ARGS,
      "message2": TYPE_MESSAGE,
      "args2": TYPE_ARGS,
      "previousStatement": "Input",
      "nextStatement": "Input",
      "colour": 210,
      "tooltip": "A value socket for horizontal connections.",
    });
  },
  onchange: function () {
    inputNameCheck(this);
  }
};

Blockly.Blocks['input_statement'] = {
  // Statement input.
  init: function () {
    this.jsonInit({
      "message0": "语句块 %1 %2",
      "args0": [
        {
          "type": "field_input",
          "name": "INPUTNAME",
          "text": "NAME"
        },
        {
          "type": "input_dummy"
        },
      ],
      "message1": FIELD_MESSAGE,
      "args1": FIELD_ARGS,
      "message2": TYPE_MESSAGE,
      "args2": TYPE_ARGS,
      "previousStatement": "Input",
      "nextStatement": "Input",
      "colour": 210,
      "tooltip": "A statement socket for enclosed vertical stacks.",
    });
  },
  onchange: function () {
    inputNameCheck(this);
  }
};

Blockly.Blocks['input_dummy'] = {
  // Dummy input.
  init: function () {
    this.jsonInit({
      "message0": "虚拟输入",
      "message1": FIELD_MESSAGE,
      "args1": FIELD_ARGS,
      "previousStatement": "Input",
      "nextStatement": "Input",
      "colour": 210,
      "tooltip": "添加一个没有空位的输入， 可以用于制作文字标签或者输入框等",
    });
  }
};

Blockly.Blocks['field_static'] = {
  // Text value.
  init: function () {
    this.setColour(160);
    this.appendDummyInput('FIRST')
      .appendField('描述文本')
      .appendField(new Blockly.FieldTextInput(''), 'TEXT');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('在积木上显示文本.');
  },
};

Blockly.Blocks['field_label_serializable'] = {
  // Text value that is saved to XML.
  init: function () {
    this.setColour(160);
    this.appendDummyInput('FIRST')
      .appendField('缺省值文本')
      .appendField(new Blockly.FieldTextInput(''), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('参数名称'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('不仅可以用来显示文本，还可以当做生成代码的一部分.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_input'] = {
  // Text input.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('文本输入框')
      .appendField(new Blockly.FieldTextInput('默认内容'), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('参数名称'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('创建可以输入文本的输入框');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_number'] = {
  // Numeric input.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('numeric input')
      .appendField(new Blockly.FieldNumber(0), 'VALUE')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.appendDummyInput()
      .appendField('min')
      .appendField(new Blockly.FieldNumber(-Infinity), 'MIN')
      .appendField('max')
      .appendField(new Blockly.FieldNumber(Infinity), 'MAX')
      .appendField('precision')
      .appendField(new Blockly.FieldNumber(0, 0), 'PRECISION');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter a number.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_angle'] = {
  // Angle input.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('angle input')
      .appendField(new Blockly.FieldAngle('90'), 'ANGLE')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('An input field for the user to enter an angle.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_dropdown'] = {
  // Dropdown menu.
  init: function () {
    this.appendDummyInput()
      .appendField('dropdown')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.optionList_ = ['text', 'text', 'text'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setMutator(new Blockly.Mutator(['field_dropdown_option_text',
      'field_dropdown_option_image']));
    this.setColour(160);
    this.setTooltip('Dropdown menu with a list of options.');
  },
  mutationToDom: function (workspace) {
    // Create XML to represent menu options.
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('options', JSON.stringify(this.optionList_));
    return container;
  },
  domToMutation: function (container) {
    // Parse XML to restore the menu options.
    var value = JSON.parse(container.getAttribute('options'));
    if (typeof value == 'number') {
      // Old format from before images were added.  November 2016.
      this.optionList_ = [];
      for (var i = 0; i < value; i++) {
        this.optionList_.push('text');
      }
    } else {
      this.optionList_ = value;
    }
    this.updateShape_();
  },
  decompose: function (workspace) {
    // Populate the mutator's dialog with this block's components.
    var containerBlock = workspace.newBlock('field_dropdown_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.optionList_.length; i++) {
      var optionBlock = workspace.newBlock(
        'field_dropdown_option_' + this.optionList_[i]);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (containerBlock) {
    // Reconfigure this block based on the mutator dialog's components.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    this.optionList_.length = 0;
    var data = [];
    while (optionBlock) {
      if (optionBlock.type == 'field_dropdown_option_text') {
        this.optionList_.push('text');
      } else if (optionBlock.type == 'field_dropdown_option_image') {
        this.optionList_.push('image');
      }
      data.push([optionBlock.userData_, optionBlock.cpuData_]);
      optionBlock = optionBlock.nextConnection &&
        optionBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Restore any data.
    for (var i = 0; i < this.optionList_.length; i++) {
      var userData = data[i][0];
      if (userData !== undefined) {
        if (typeof userData == 'string') {
          this.setFieldValue(userData || 'option', 'USER' + i);
        } else {
          this.setFieldValue(userData.src, 'SRC' + i);
          this.setFieldValue(userData.width, 'WIDTH' + i);
          this.setFieldValue(userData.height, 'HEIGHT' + i);
          this.setFieldValue(userData.alt, 'ALT' + i);
        }
        this.setFieldValue(data[i][1] || 'OPTIONNAME', 'CPU' + i);
      }
    }
  },
  saveConnections: function (containerBlock) {
    // Store all data for each option.
    var optionBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (optionBlock) {
      optionBlock.userData_ = this.getUserData(i);
      optionBlock.cpuData_ = this.getFieldValue('CPU' + i);
      i++;
      optionBlock = optionBlock.nextConnection &&
        optionBlock.nextConnection.targetBlock();
    }
  },
  updateShape_: function () {
    // Delete everything.
    var i = 0;
    while (this.getInput('OPTION' + i)) {
      this.removeInput('OPTION' + i);
      this.removeInput('OPTION_IMAGE' + i, true);
      i++;
    }
    // Rebuild block.
    var src = 'https://www.gstatic.com/codesite/ph/images/star_on.gif';
    for (var i = 0; i <= this.optionList_.length; i++) {
      var type = this.optionList_[i];
      if (type == 'text') {
        this.appendDummyInput('OPTION' + i)
          .appendField('•')
          .appendField(new Blockly.FieldTextInput('option'), 'USER' + i)
          .appendField(',')
          .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      } else if (type == 'image') {
        this.appendDummyInput('OPTION' + i)
          .appendField('•')
          .appendField('image')
          .appendField(new Blockly.FieldTextInput(src), 'SRC' + i);
        this.appendDummyInput('OPTION_IMAGE' + i)
          .appendField(' ')
          .appendField('width')
          .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'WIDTH' + i)
          .appendField('height')
          .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'HEIGHT' + i)
          .appendField('alt text')
          .appendField(new Blockly.FieldTextInput('*'), 'ALT' + i)
          .appendField(',')
          .appendField(new Blockly.FieldTextInput('OPTIONNAME'), 'CPU' + i);
      }
    }
  },
  onchange: function () {
    if (this.workspace && this.optionList_.length < 1) {
      this.setWarningText('Drop down menu must\nhave at least one option.');
    } else {
      fieldNameCheck(this);
    }
  },
  getUserData: function (n) {
    if (this.optionList_[n] == 'text') {
      return this.getFieldValue('USER' + n);
    }
    if (this.optionList_[n] == 'image') {
      return {
        src: this.getFieldValue('SRC' + n),
        width: Number(this.getFieldValue('WIDTH' + n)),
        height: Number(this.getFieldValue('HEIGHT' + n)),
        alt: this.getFieldValue('ALT' + n)
      };
    }
    throw 'Unknown dropdown type';
  }
};

Blockly.Blocks['field_dropdown_container'] = {
  // Container.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('add options');
    this.appendStatementInput('STACK');
    this.setTooltip('Add, remove, or reorder options\n' +
      'to reconfigure this dropdown menu.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['field_dropdown_option_text'] = {
  // Add text option.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('text option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new text option to the dropdown menu.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['field_dropdown_option_image'] = {
  // Add image option.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('image option');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip('Add a new image option to the dropdown menu.');
    this.contextMenu = false;
  }
};

Blockly.Blocks['field_checkbox'] = {
  // Checkbox.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('checkbox')
      .appendField(new Blockly.FieldCheckbox('TRUE'), 'CHECKED')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Checkbox field.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_colour'] = {
  // Colour input.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('colour')
      .appendField(new Blockly.FieldColour('#ff0000'), 'COLOUR')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Colour input field.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_variable'] = {
  // Dropdown for variables.
  init: function () {
    this.setColour(160);
    this.appendDummyInput()
      .appendField('variable')
      .appendField(new Blockly.FieldTextInput('item'), 'TEXT')
      .appendField(',')
      .appendField(new Blockly.FieldTextInput('NAME'), 'FIELDNAME');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Dropdown menu for variable names.');
  },
  onchange: function () {
    fieldNameCheck(this);
  }
};

Blockly.Blocks['field_image'] = {
  // Image.
  init: function () {
    this.setColour(160);
    var src = 'https://www.gstatic.com/codesite/ph/images/star_on.gif';
    this.appendDummyInput()
      .appendField('image')
      .appendField(new Blockly.FieldTextInput(src), 'SRC');
    this.appendDummyInput()
      .appendField('width')
      .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'WIDTH')
      .appendField('height')
      .appendField(new Blockly.FieldNumber('15', 0, NaN, 1), 'HEIGHT')
      .appendField('alt text')
      .appendField(new Blockly.FieldTextInput('*'), 'ALT')
      .appendField('flip RTL')
      .appendField(new Blockly.FieldCheckbox('false'), 'FLIP_RTL');
    this.setPreviousStatement(true, 'Field');
    this.setNextStatement(true, 'Field');
    this.setTooltip('Static image (JPEG, PNG, GIF, SVG, BMP).\n' +
      'Retains aspect ratio regardless of height and width.\n' +
      'Alt text is for when collapsed.');
  }
};

Blockly.Blocks['type_group'] = {
  // Group of types.
  init: function () {
    this.typeCount_ = 2;
    this.updateShape_();
    this.setOutput(true, 'Type');
    this.setMutator(new Blockly.Mutator(['type_group_item']));
    this.setColour(230);
    this.setTooltip('Allows more than one type to be accepted.');
  },
  mutationToDom: function (workspace) {
    // Create XML to represent a group of types.
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('types', this.typeCount_);
    return container;
  },
  domToMutation: function (container) {
    // Parse XML to restore the group of types.
    this.typeCount_ = parseInt(container.getAttribute('types'), 10);
    this.updateShape_();
    for (var i = 0; i < this.typeCount_; i++) {
      this.removeInput('TYPE' + i);
    }
    for (var i = 0; i < this.typeCount_; i++) {
      var input = this.appendValueInput('TYPE' + i)
        .setCheck('Type');
      if (i == 0) {
        input.appendField('以下任意一个');
      }
    }
  },
  decompose: function (workspace) {
    // Populate the mutator's dialog with this block's components.
    var containerBlock = workspace.newBlock('type_group_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.typeCount_; i++) {
      var typeBlock = workspace.newBlock('type_group_item');
      typeBlock.initSvg();
      connection.connect(typeBlock.previousConnection);
      connection = typeBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function (containerBlock) {
    // Reconfigure this block based on the mutator dialog's components.
    var typeBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (typeBlock) {
      connections.push(typeBlock.valueConnection_);
      typeBlock = typeBlock.nextConnection &&
        typeBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.typeCount_; i++) {
      var connection = this.getInput('TYPE' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.typeCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.typeCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'TYPE' + i);
    }
  },
  saveConnections: function (containerBlock) {
    // Store a pointer to any connected child blocks.
    var typeBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (typeBlock) {
      var input = this.getInput('TYPE' + i);
      typeBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
      typeBlock = typeBlock.nextConnection &&
        typeBlock.nextConnection.targetBlock();
    }
  },
  updateShape_: function () {
    // Modify this block to have the correct number of inputs.
    // Add new inputs.
    for (var i = 0; i < this.typeCount_; i++) {
      if (!this.getInput('TYPE' + i)) {
        var input = this.appendValueInput('TYPE' + i);
        if (i == 0) {
          input.appendField('any of');
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('TYPE' + i)) {
      this.removeInput('TYPE' + i);
      i++;
    }
  }
};

Blockly.Blocks['type_group_container'] = {
  // Container.
  init: function () {
    this.jsonInit({
      "message0": "add types %1 %2",
      "args0": [
        {"type": "input_dummy"},
        {"type": "input_statement", "name": "STACK"}
      ],
      "colour": 230,
      "tooltip": "Add, or remove allowed type.",
    });
  }
};

Blockly.Blocks['type_group_item'] = {
  // Add type.
  init: function () {
    this.jsonInit({
      "message0": "type",
      "previousStatement": null,
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Add a new allowed type.",
    });
  }
};

Blockly.Blocks['type_null'] = {
  // Null type.
  valueType: null,
  init: function () {
    this.jsonInit({
      "message0": "any",
      "output": "Type",
      "colour": 230,
      "tooltip": "Any type is allowed.",
    });
  }
};

Blockly.Blocks['type_boolean'] = {
  // Boolean type.
  valueType: 'Boolean',
  init: function () {
    this.jsonInit({
      "message0": "Boolean",
      "output": "Type",
      "colour": 230,
      "tooltip": "Booleans (true/false) are allowed.",
    });
  }
};

Blockly.Blocks['type_number'] = {
  // Number type.
  valueType: 'Number',
  init: function () {
    this.jsonInit({
      "message0": "Number",
      "output": "Type",
      "colour": 230,
      "tooltip": "Numbers (int/float) are allowed.",
    });
  }
};

Blockly.Blocks['type_string'] = {
  // String type.
  valueType: 'String',
  init: function () {
    this.jsonInit({
      "message0": "String",
      "output": "Type",
      "colour": 230,
      "tooltip": "Strings (text) are allowed.",
    });
  }
};

Blockly.Blocks['type_list'] = {
  // List type.
  valueType: 'Array',
  init: function () {
    this.jsonInit({
      "message0": "Array",
      "output": "Type",
      "colour": 230,
      "tooltip": "Arrays (lists) are allowed.",
    });
  }
};

Blockly.Blocks['type_other'] = {
  // Other type.
  init: function () {
    this.jsonInit({
      "message0": "other %1",
      "args0": [{"type": "field_input", "name": "TYPE", "text": ""}],
      "output": "Type",
      "colour": 230,
      "tooltip": "Custom type to allow.",
    });
  }
};

Blockly.Blocks['colour_hue'] = {
  // Set the colour of the block.
  init: function () {
    this.appendDummyInput()
      .appendField('hue颜色:')
      .appendField(new Blockly.FieldAngle('0', this.validator), 'HUE');
    this.setOutput(true, 'Colour');
    this.setTooltip('Paint the block with this colour.');
  },
  validator: function (text) {
    // Update the current block's colour to match.
    var hue = parseInt(text, 10);
    if (!isNaN(hue)) {
      this.getSourceBlock().setColour(hue);
    }
  },
  mutationToDom: function (workspace) {
    var container = Blockly.utils.xml.createElement('mutation');
    container.setAttribute('colour', this.getColour());
    return container;
  },
  domToMutation: function (container) {
    this.setColour(container.getAttribute('colour'));
  }
};

/**
 * Check to see if more than one field has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function fieldNameCheck(referenceBlock) {
  if (!referenceBlock.workspace) {
    // Block has been deleted.
    return;
  }
  var name = referenceBlock.getFieldValue('FIELDNAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var otherName = block.getFieldValue('FIELDNAME');
    if (!block.disabled && !block.getInheritedDisabled() &&
      otherName && otherName.toLowerCase() == name) {
      count++;
    }
  }
  var msg = (count > 1) ?
    'There are ' + count + ' field blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}

/**
 * Check to see if more than one input has this name.
 * Highly inefficient (On^2), but n is small.
 * @param {!Blockly.Block} referenceBlock Block to check.
 */
function inputNameCheck(referenceBlock) {
  if (!referenceBlock.workspace) {
    // Block has been deleted.
    return;
  }
  var name = referenceBlock.getFieldValue('INPUTNAME').toLowerCase();
  var count = 0;
  var blocks = referenceBlock.workspace.getAllBlocks(false);
  for (var i = 0, block; block = blocks[i]; i++) {
    var otherName = block.getFieldValue('INPUTNAME');
    if (!block.disabled && !block.getInheritedDisabled() &&
      otherName && otherName.toLowerCase() == name) {
      count++;
    }
  }
  var msg = (count > 1) ?
    'There are ' + count + ' input blocks\n with this name.' : null;
  referenceBlock.setWarningText(msg);
}
