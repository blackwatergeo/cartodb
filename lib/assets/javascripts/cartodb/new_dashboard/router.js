var cdb = require('cartodb.js');
var _ = require('underscore');
var Router = require('../new_common/router');
var RouterModel = require('./router/model');
var Utils = require('cdb.Utils');

/**
 *  Backbone router for dashboard urls.
 *  Actual URLs can be retrieved from router.model.toXXX-methods.
 *
 *  - Manage all available urls
 *    · Organization
 *    · Shared
 *    · Pretty urls
 *    · ...
 */
module.exports = Router.extend({

  routes: {

    // Index
    '':                                              '_changeRouteToMaps',
    '?:queries':                                     '_changeRouteToMaps',

    // If URL is lacking the trailing slash (e.g. 'http://username.cartodb.com/dashboard'), treat it like index
    'dashboard':                                     '_changeRouteToMaps',
    'dashboard?:queries':                            '_changeRouteToMaps',
    '*prefix/dashboard':                             '_changeRouteToMaps',
    '*prefix/dashboard?:queries':                    '_changeRouteToMaps',

    // Supporting old tables/vis urls
    'tables':                                        '_changeRouteToDatasets',
    'tables/:whatever':                              '_changeRouteToDatasets',
    'visualizations':                                '_changeRouteToMaps',
    'visualizations/:whatever':                      '_changeRouteToMaps',

    // Search
    ':content_type/search/:q':                       '_changeRouteToSearch',
    ':content_type/search/:q/:page':                 '_changeRouteToSearch',

    // Tags only in shared datasets/maps
    ':content_type/shared/tag/:tag':                 '_changeRouteToTag',
    ':content_type/shared/tag/:tag/:page':           '_changeRouteToTag',

    // Tags only in liked datasets/maps
    ':content_type/liked/tag/:tag':                  '_changeRouteToTag',
    ':content_type/liked/tag/:tag/:page':            '_changeRouteToTag',

    // Tags in my locked datasets/maps
    ':content_type/locked/tag/:tag':                 '_changeRouteToTag',
    ':content_type/locked/tag/:tag/:page':           '_changeRouteToTag',

    // Tags in library datasets/maps
    ':content_type/library/tag/:tag':                '_changeRouteToTag',
    ':content_type/library/tag/:tag/:page':          '_changeRouteToTag',

    // Tags
    ':content_type/tag/:tag':                        '_changeRouteToTag',
    ':content_type/tag/:tag/:page':                  '_changeRouteToTag',

    // Liked datasets
    'datasets/liked':                         '_changeRouteToDatasets',
    'datasets/liked/':                        '_changeRouteToDatasets',
    'datasets/liked?:q':                      '_changeRouteToDatasets',
    'datasets/liked/:page':                   '_changeRouteToDatasets',
    'datasets/liked/:page?:q':                '_changeRouteToDatasets',


    // Shared datasets
    'datasets/shared':                        '_changeRouteToDatasets',
    'datasets/shared/':                       '_changeRouteToDatasets',
    'datasets/shared?:q':                     '_changeRouteToDatasets',
    'datasets/shared/:page':                  '_changeRouteToDatasets',
    'datasets/shared/:page?:q':               '_changeRouteToDatasets',

    // Datasets locked
    'datasets/locked':                        '_changeRouteToDatasets',
    'datasets/locked/':                       '_changeRouteToDatasets',
    'datasets/locked?:q':                     '_changeRouteToDatasets',
    'datasets/locked/:page':                  '_changeRouteToDatasets',
    'datasets/locked/:page?:q':               '_changeRouteToDatasets',

    // Library datasets
    'datasets/library':                       '_changeRouteToDatasets',
    'datasets/library/':                      '_changeRouteToDatasets',
    'datasets/library?:q':                    '_changeRouteToDatasets',
    'datasets/library/:page':                 '_changeRouteToDatasets',
    'datasets/library/:page?:q':              '_changeRouteToDatasets',

    // Datasets
    'datasets':                               '_changeRouteToDatasets',
    'datasets/':                              '_changeRouteToDatasets',
    'datasets?:q':                            '_changeRouteToDatasets',
    'datasets/:page':                         '_changeRouteToDatasets',
    'datasets/:page?:q':                      '_changeRouteToDatasets',

    // My shared maps
    'maps/shared':                            '_changeRouteToMaps',
    'maps/shared/':                           '_changeRouteToMaps',
    'maps/shared?:q':                         '_changeRouteToMaps',
    'maps/shared/:page':                      '_changeRouteToMaps',
    'maps/shared/:page?:q':                   '_changeRouteToMaps',

    // Locked maps
    'maps/locked':                            '_changeRouteToMaps',
    'maps/locked/':                           '_changeRouteToMaps',
    'maps/locked?:q':                         '_changeRouteToMaps',
    'maps/locked/:page':                      '_changeRouteToMaps',
    'maps/locked/:page?:q':                   '_changeRouteToMaps',

    // Shared locked maps
    'maps/shared/locked':                     '_changeRouteToMaps',
    'maps/shared/locked/':                    '_changeRouteToMaps',
    'maps/shared/locked?:q':                  '_changeRouteToMaps',
    'maps/shared/locked/:page':               '_changeRouteToMaps',
    'maps/shared/locked/:page?:q':            '_changeRouteToMaps',

    // Liked maps
    'maps/liked':                             '_changeRouteToMaps',
    'maps/liked/':                            '_changeRouteToMaps',
    'maps/liked?:q':                          '_changeRouteToMaps',
    'maps/liked/:page':                       '_changeRouteToMaps',
    'maps/liked/:page?:q':                    '_changeRouteToMaps',

    // Maps
    'maps':                                   '_changeRouteToMaps',
    'maps/':                                  '_changeRouteToMaps',
    'maps?:q':                                '_changeRouteToMaps',
    'maps/:page':                             '_changeRouteToMaps',
    'maps/:page?:q':                          '_changeRouteToMaps'
  },

  initialize: function(opts) {
    this._dashboardUrl = opts.dashboardUrl;
    this._rootPath = this._dashboardUrl.pathname();

    this.model = new RouterModel({
      // Attributes will be set by one of the route handlers below, upon router.enableAfterMainView()
    }, {
      dashboardUrl: this._dashboardUrl
    });
  },

  rootPath: function() {
    return this._rootPath;
  },

  normalizeFragmentOrUrl: function(fragmentOrUrl) {
    return fragmentOrUrl.toString().replace(this._dashboardUrl, '');
  },

  /**
   * Get current dashboard URL (i.e. datasets or maps).
   * @return {Object} instance of cdb.common.DashboardVisUrl
   */
  currentDashboardUrl: function() {
    return this.model.urlForCurrentContentType();
  },

  /**
   * Get a URL based on current state.
   * @params {Object} override hash of keys to override, see Router.model.urlForCurrentState for alternatives.
   */
  currentUrl: function(override) {
    return this.model.urlForCurrentState(override);
  },

  _changeRouteToSearch: function(contentType, q, page) {
    page = this._getPage(page);
    var shared = this._doesCurrentUrlContain('shared/search');
    var locked = this._doesCurrentUrlContain('locked/search');
    var liked = this._doesCurrentUrlContain('liked/search');
    var library = this._doesCurrentUrlContain('library/search');

    this.model.set({
      action:         'search',
      content_type:   contentType,
      q:              Utils.stripHTML(decodeURIComponent(q),''),
      tag:            '',
      page:           page,
      shared:         'yes',
      locked:         null,
      liked:          null,
      library:        null
    });
  },

  _changeRouteToTag: function(contentType, tag, page) {
    page = this._getPage(page);
    var shared = this._doesCurrentUrlContain('shared/tag');
    var locked = this._doesCurrentUrlContain('locked/tag');
    var liked = this._doesCurrentUrlContain('liked/tag');
    var library = this._doesCurrentUrlContain('library/tag');

    this.model.set({
      action:         'tag',
      content_type:   contentType,
      tag:            Utils.stripHTML(decodeURIComponent(tag),''),
      q:              '',
      page:           page,
      shared:         'yes',
      locked:         null,
      liked:          null,
      library:        null
    });
  },

  _changeRouteToDatasets: function(page) {
    page = this._getPage(page);
    var shared = this._doesCurrentUrlContain('datasets/shared');
    var locked = this._doesCurrentUrlContain('datasets/locked') || this._doesCurrentUrlContain('shared/locked');
    var liked = this._doesCurrentUrlContain('datasets/liked');
    var library = this._doesCurrentUrlContain('datasets/library');

    this.model.set({
      content_type:   'datasets',
      page:           page,
      q:              '',
      tag:            '',
      shared:         shared ? 'only' : 'no',
      locked:         locked,
      liked:          liked,
      library:        library
    });
  },

  _changeRouteToMaps: function(page) {
    page = this._getPage(page);
    var shared = this._doesCurrentUrlContain('maps/shared');
    var locked = this._doesCurrentUrlContain('maps/locked') || this._doesCurrentUrlContain('shared/locked');
    var liked = this._doesCurrentUrlContain('maps/liked');

    this.model.set({
      content_type:   'maps',
      page:           page,
      q:              '',
      tag:            '',
      shared:         shared ? 'only' : 'no',
      locked:         locked,
      liked:          liked,
      library:        false
    });
  },

  _doesCurrentUrlContain: function(uri) {
    return Backbone.history.fragment.search(uri) !== -1;
  },

  _getPage: function(page) {
    page = parseInt(page);
    return page && _.isNumber(page) ? page : 1;
  }

});
