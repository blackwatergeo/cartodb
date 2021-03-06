var cdb = require('cartodb.js');
var _ = require('underscore');

/**
 * Default model for a privacy option.
 */
module.exports = cdb.core.Model.extend({
  
  defaults: {
    privacy: 'PUBLIC',
    disabled: false,
    selected: false,
    password: undefined
  },

  validate: function(attrs) {
    if (attrs.disabled && attrs.selected) {
      return 'Option can not be disabled and selected at the same time';
    }
  },
  
  classNames: function() {
    return _.chain(['disabled', 'selected'])
      .map(function(attr) { return !!this.attributes[attr] ? 'is-'+attr : undefined; }, this)
      .compact().value().join(' ');
  },
  
  canSave: function() {
    return !this.get('disabled');
  },

  /**
   * @param vis {Object} instance of cdb.admin.Visualization
   * @return {Object} jqXHR returned by vis.save
   */
  saveToVis: function(vis) {
    return vis.save(this._attrsToSave(), { wait: true });
  },

  /**
   * @returns {Object} attrs
   * @protected
   */
  _attrsToSave: function() {
    return _.pick(this.attributes, 'privacy', 'password');
  }
});
