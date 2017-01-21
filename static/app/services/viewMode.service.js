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
define(['angularAMD'], function (angularAMD) {
	'use strict';
	angularAMD.factory('viewModeService', ViewModeService);

	function ViewModeService($stateParams) {
		var keys = {
			SUITE: 'suite',
			TEST: 'test',
			URL: 'url',
			COMPARATOR: 'comparator'
		};
		return {
			get: get,
			SUITE: keys.SUITE,
			TEST: keys.TEST,
			URL: keys.URL,
			COMPARATOR: keys.COMPARATOR
		};

		function get() {
			var mode;
			if ($stateParams.url) {
				mode = keys.URL;
			} else if ($stateParams.test) {
				mode = keys.TEST;
			} else {
				mode = keys.SUITE;
			}
			return mode;
		}
	}
});