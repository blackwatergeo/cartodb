var cdb = require('cartodb.js');

/**
 *  Import limit message within background importer
 *
 */

module.exports = cdb.core.View.extend({

  className: 'ImportItem ImportItem--sticky',
  tagName: 'li',

  initialize: function() {
    this.user = this.options.user;
    this.template = cdb.templates.getTemplate('new_dashboard/views/background_importer/background_importer_limit_view');
  },

  render: function() {
    var userActions = this.user.get('actions');
    var importQuota = ( userActions && userActions.import_quota ) || 1;
    var isUpgradeable = !cdb.config.get('custom_com_hosted') && importQuota === 1;

    this.$el.html(
      this.template({
        upgradeUrl: window.upgrade_url,
        isUpgradeable: isUpgradeable,
        importQuota: importQuota
      })
    );

    return this;
  }

});
