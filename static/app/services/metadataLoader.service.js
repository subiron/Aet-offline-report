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
define(['angularAMD', 'configService', 'metadataService', 'metadataEndpointService'], function (angularAMD) {
	'use strict';
	angularAMD.factory('metadataLoaderService', MetadataLoaderService);

	/**
	 * Service fetches metadata and inits metadata service.
	 */
	function MetadataLoaderService($rootScope, $q, metadataService, metadataEndpointService) {
		var deferred = null;

		return {
			setup: function () {
				if (deferred === null) {
					$rootScope.metadataLoadingStatus = 'IN_PROGRESS';
					deferred = $q.defer();
					metadataEndpointService.getMetadata()
						.then(function (aetMetadataResponse) {
							metadataService.ingestData(aetMetadataResponse);
							$rootScope.metadataLoadingStatus = 'SUCCESS';
							deferred.resolve();
						})
						.catch(handleFailed);
				}
				return deferred.promise;
			}
		};

		/***************************************
		 ***********  Private methods  *********
		 ***************************************/

		function handleFailed(exception) {
			console.error('Can\'t setup suite metadata!', exception);
			$rootScope.metadataLoadingStatus = 'FAILED';
			alert('Failed to load report data!');
		}
	}
});
