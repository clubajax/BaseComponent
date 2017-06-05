(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(["BaseComponent", "dom"], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node / CommonJS
        module.exports = factory(require('BaseComponent'), require('dom'));
    } else {
        // Browser globals (root is window)
        root['undefined'] = factory(root.BaseComponent, root.dom);
    }
	}(this, function (BaseComponent, dom) {
'use strict';

function setBoolean(node, prop) {
	Object.defineProperty(node, prop, {
		enumerable: true,
		configurable: true,
		get: function get() {
			return node.hasAttribute(prop);
		},
		set: function set(value) {
			this.isSettingAttribute = true;
			if (value) {
				this.setAttribute(prop, '');
			} else {
				this.removeAttribute(prop);
			}
			var fn = this[onify(prop)];
			if (fn) {
				fn.call(this, value);
			}

			this.isSettingAttribute = false;
		}
	});
}

function setProperty(node, prop) {
	Object.defineProperty(node, prop, {
		enumerable: true,
		configurable: true,
		get: function get() {
			return dom.normalize(this.getAttribute(prop));
		},
		set: function set(value) {
			this.isSettingAttribute = true;
			this.setAttribute(prop, value);
			var fn = this[onify(prop)];
			if (fn) {
				fn.call(this, value);
			}
			this.isSettingAttribute = false;
		}
	});
}

function setObject(node, prop) {
	Object.defineProperty(node, prop, {
		enumerable: true,
		configurable: true,
		get: function get() {
			return this['__' + prop];
		},
		set: function set(value) {
			this['__' + prop] = value;
		}
	});
}

function setProperties(node) {
	var props = node.props || node.properties;
	if (props) {
		props.forEach(function (prop) {
			if (prop === 'disabled') {
				setBoolean(node, prop);
			} else {
				setProperty(node, prop);
			}
		});
	}
}

function setBooleans(node) {
	var props = node.bools || node.booleans;
	if (props) {
		props.forEach(function (prop) {
			setBoolean(node, prop);
		});
	}
}

function setObjects(node) {
	var props = node.objects;
	if (props) {
		props.forEach(function (prop) {
			setObject(node, prop);
		});
	}
}

function onify(name) {
	return 'on' + name.substring(0, 1).toUpperCase() + name.substring(1);
}

function isBool(node, name) {
	return (node.bools || node.booleans || []).indexOf(name) > -1;
}

BaseComponent.addPlugin({
	name: 'properties',
	order: 10,
	init: function init(node) {
		setProperties(node);
		setBooleans(node);
	},
	preAttributeChanged: function preAttributeChanged(node, name, value) {
		if (node.isSettingAttribute) {
			return false;
		}

		if (isBool(node, name)) {
			node[name] = value !== null;
			if (value === null) {
				node[name] = false;
				node.isSettingAttribute = true;
				node.removeAttribute(name);
				node.isSettingAttribute = false;
			} else {
				node[name] = true;
			}
			return;
		}

		node[name] = dom.normalize(value);
	}
});

}));