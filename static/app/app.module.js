/*
 * Automated Exploratory Tests
 *
 * Copyright (C) 2013 Cognifide Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* jshint node: true */
'use strict';
define(['angularAMD',
	// **** LIBRARIES ****
	'lodash',
	'angular-bootstrap',
	'angular-ui-router',
	'jquery',
	'bootstrap',
	'scroller',
	// **** OLD STRUCTURE ****
	'apiServices',
	'sessionStorageService',
	'tabStateService',
	'cachingService',
	'configService',
	'suiteParamsService',
	'toggleLinkDirective',
	'commentDirective',
	'saveChangesDirective',
	'scrollTablesDirective',
	'truncateUrlsDirective',
	'hidePopoversDirective',
	'tabNavigationDirective',
	// **** NEW STRUCTURE ****
	// components
	'keyboardShortcutsDirective',
	'testUrlsSearch',
	'testUrlsStatusFilter',
	'urlStatusFilter',
	// services
	'metadataEndpointService',
	'metadataLoaderService',
	'localStorageService',
	'requestParametersService',
	'metadataCacheService',
	'metadataService',
	'metadataAccessService',
	'notesService',
	'suiteInfoService',
	'patternsService',
	'userSettingsService',
	'viewModeService',
	// sidepanel
	'sidepanelToggleDirective',
	'sidepanelStatusFilterDirective',
	'sidepanelSearchDirective',
	// modals
	'noteModalController',
	'unsavedChangesModalController'], function (angularAMD, _) {

	var app = angular.module('app', ['ui.router', 'ui.bootstrap']);

	app.run([
		'$rootScope',
		'$state',
		'$uibModal',
		'apiServices',
		'cachingService',
		'suiteParamsService',
		'metadataService',
		'userSettingsService',
		'metadataLoaderService',
		function ($rootScope,
		          $state,
		          $uibModal,
		          apiServices,
		          cachingService,
		          suiteParamsService,
		          metadataService,
		          userSettingsService,
		          metadataLoaderService) {

			$rootScope.metadataSaveInProgress = false;
			metadataLoaderService.setup();
			
			$rootScope.$state = $state;

			suiteParamsService.setParams();

			var suiteParams = suiteParamsService.getParams();

			$rootScope.hasChanges = cachingService.hasScheduledChanges(suiteParams.company, suiteParams.project, suiteParams.suite) ? cachingService.hasScheduledChanges(suiteParams.company, suiteParams.project, suiteParams.suite).changesCount : 0;

			apiServices.getMetadata(suiteParams.company, suiteParams.project, suiteParams.suite, suiteParams.correlationId).then(function (data) {
				apiServices.processData(data);
			});

			$rootScope.$on('metadata:unsavedChangesDetected', function (event, oldSuite) {
				displayNotificationModal($uibModal, oldSuite);
			});

			//apply user settings
			$rootScope.maskVisible = userSettingsService.isScreenshotMaskVisible();
			$rootScope.fullSourceVisible = userSettingsService.isFullSourceVisible();
		}]);

	app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', function ($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider) {
		$compileProvider.debugInfoEnabled(false);

		$stateProvider
			.state('root', angularAMD.route({
				views: {
					'sidepanel@': angularAMD.route({
						templateUrl: 'app/layout/sidepanel/sidepanel.view.html',
						controllerUrl: 'layout/sidepanel/sidepanel.controller',
						controllerAs: 'sidepanel',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					})
				}
			}))
			.state('suite', angularAMD.route({
				url: '/suite',
				parent: 'root',
				views: {
					'content@': angularAMD.route({
						templateUrl: 'app/layout/main/suite/mainView.suite.view.html',
						controllerUrl: 'layout/main/suite/mainView.suite.controller',
						controllerAs: 'suiteView',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarTop@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarTop.view.html',
						controllerUrl: 'layout/toolbar/toolbarTop.controller',
						controllerAs: 'toolbarTop',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarBottom@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarBottom.view.html',
						controllerUrl: 'layout/toolbar/toolbarBottom.controller',
						controllerAs: 'toolbarBottom',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					})
				}
			}))
			.state('test', angularAMD.route({
				url: '/test/:test',
				parent: 'root',
				views: {
					'content@': angularAMD.route({
						templateUrl: 'app/layout/main/test/mainView.test.view.html',
						controllerUrl: 'layout/main/test/mainView.test.controller',
						controllerAs: 'testView',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarTop@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarTop.view.html',
						controllerUrl: 'layout/toolbar/toolbarTop.controller',
						controllerAs: 'toolbarTop',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarBottom@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarBottom.view.html',
						controllerUrl: 'layout/toolbar/toolbarBottom.controller',
						controllerAs: 'toolbarBottom',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					})
				}
			}))
			.state('url', angularAMD.route({
				url: '/url/:test/:url',
				parent: 'root',
				cache: true,
				views: {
					'content@': angularAMD.route({
						templateUrl: 'app/html/url_view.html',
						controllerUrl: '_old_js/controllers/url',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarTop@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarTop.view.html',
						controllerUrl: 'layout/toolbar/toolbarTop.controller',
						controllerAs: 'toolbarTop',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					}),
					'toolbarBottom@': angularAMD.route({
						templateUrl: 'app/layout/toolbar/toolbarBottom.view.html',
						controllerUrl: 'layout/toolbar/toolbarBottom.controller',
						controllerAs: 'toolbarBottom',
						resolve: {
							metadataReady: function (metadataLoaderService) {
								return metadataLoaderService.setup();
							}
						}
					})
				}
			}));
		$urlRouterProvider.otherwise('/suite');
	}]);

	app.filter('to_trusted', ['$sce', function ($sce) { // safely include html code
		return function (text) {
			return $sce.trustAsHtml(text);
		};
	}]);

	function displayNotificationModal($uibModal, oldSuite) {
		$uibModal.open({
			animation: true,
			templateUrl: 'app/layout/modal/unsavedChanges/unsavedChangesModal.view.html',
			controller: 'unsavedChangesModalController',
			controllerAs: 'unsavedChangesModal',
			resolve: {
				oldSuite: function() {
					return oldSuite;
				}
			}
		});
	}

	return angularAMD.bootstrap(app);
});
