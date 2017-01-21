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
define(['angularAMD', 'userSettingsService'], function (angularAMD) {
	'use strict';
	angularAMD.directive('aetKeyboardShortcuts', ['userSettingsService', '$rootScope', keyboardShortcutsDirective]);

	function keyboardShortcutsDirective(userSettingsService, $rootScope) {

		return {
			restrict: 'A',
			link: linkFunc
		};

		function linkFunc(scope) {

			/*
			 code 37 - arrow left
			 code 39 - arrow right
			 code 69 - e
			 code 77 - m
			 code 81 - q
			 code 219 - [
			 code 221 - ]
			 */

			var shortcuts = {
				'37': function () {
					goToTab('prev');
				},
				'39': function () {
					goToTab('next');
				},
				'69': function () {
					toggleErrors();
				},
				'77': function () {
					toggleMask();
				},
				'81': function () {
					toggleAll();
				},
				'219': function () {
					scope.traverseTree('up');
				},
				'221': function () {
					scope.traverseTree('down');
				}
			};

			$(document).on('keydown', function (e) {
				if($('body').hasClass('modal-open')){
					return true;
				} else {
					shortcuts[e.keyCode]();
				}
			});

			scope.traverseTree = function (direction) {
				var $currentItem = $('.test-url.is-active'),
					$testContainer = $currentItem.parents('.url-name'),
					$suiteContainer = $currentItem.parents('.aside-report'),
					$testUrlSelector = '.test-url:not(.is-hidden)';

				if (direction === 'down') {
					traverseTreeDown($currentItem, $testContainer, $suiteContainer, $testUrlSelector);
				} else {
					traverseTreeUp($currentItem, $testContainer, $suiteContainer, $testUrlSelector);
				}
			};

			function goToTab(direction) {
				var $tabs = $('.test-tabs'),
					$active = $tabs.find('.active');

				if (direction === 'prev') {
					$active.prev().find('a').click();
				} else {
					$active.next().find('a').click();
				}

				$tabs.mCustomScrollbar('scrollTo', $tabs.find('.active'));
			}

			function toggleErrors() {
				if ($('.aside-report.is-expanded').length === $rootScope.errors) {
					$('.test-name.failed').parent().removeClass('is-expanded');
				}
				else {
					$('.test-name.failed').parent().toggleClass('is-expanded');
				}
			}

			function toggleMask() {
				$rootScope.maskVisible = userSettingsService.toggleScreenshotMask();
				scope.$apply();
			}

			function toggleAll() {
				if ($('.aside-report.is-expanded').length === 0) {
					$('.aside-report').addClass('is-expanded');
				} else {
					$('.aside-report').removeClass('is-expanded');
				}
			}

			function traverseTreeDown(currentItem, testContainer, suiteContainer, testUrlSelector) {
				var currentTest,
					currentLocation = window.location.hash,
					$nextElement;

				if (!(ifRootPage(currentLocation, '/url/') || ifRootPage(currentLocation, '/test/') || ifRootPage(currentLocation, '/report/'))) {
					selectItemIfRoot('first');
				}

				if (!_.isEmpty(currentItem)) {
					var nextUrl = testContainer.nextAll('.url-name:not(.is-hidden)').filter(':first').find(testUrlSelector);

					if (_.isEmpty(nextUrl)) {
						if (!_.isEmpty($(suiteContainer).nextAll('.aside-report:not(.is-hidden)').first().find('.test-name'))) {
							testContainer.removeClass('is-active');
							currentItem.removeClass('is-active');
							toggleNextTest(suiteContainer);
							$nextElement = suiteContainer.nextAll('.aside-report:not(.is-hidden)').first();
							scrollTo($nextElement);
							$nextElement.addClass('is-expanded');
						}

					} else {
					    scrollTo(nextUrl);
						nextUrl.click();
						$(testUrlSelector).not(nextUrl).removeClass('is-active');
					}
				} else {
					currentTest = findCurrentTest(currentLocation.split('/').pop());
					currentTest.addClass('is-expanded');
					scrollTo(currentTest);
					currentTest.find('.url-name:not(.is-hidden)').find(testUrlSelector).first().click();
				}
			}

			function traverseTreeUp(currentItem, testContainer, suiteContainer, testUrlSelector) {
				var previousTest,
					currentLocation = window.location.hash,
					$previousElement;

				if (!(ifRootPage(currentLocation, '/url/') || ifRootPage(currentLocation, '/test/') || ifRootPage(currentLocation, '/report/'))) {
					selectItemIfRoot('last');
				}

				if (!_.isEmpty(currentItem)) {
					previousTest = testContainer.prevAll('.url-name:not(.is-hidden)').filter(':first').find(testUrlSelector);
					if (_.isEmpty(previousTest)) {
					    $previousElement = suiteContainer.find('.test-name');
					    scrollTo($previousElement);
						$previousElement.click();
						currentItem.parents('.url-name').removeClass('is-active');
						suiteContainer.addClass('is-expanded');
					} else {
					    scrollTo(previousTest);
						previousTest.click();
					}
				} else {
					previousTest = findPreviousTest(currentLocation.split('/').pop());
					previousTest.addClass('is-expanded');
					$previousElement = previousTest.find('.url-name:not(.is-hidden) a').last();
					scrollTo($previousElement);
					$previousElement.click();
				}
			}

			function scrollTo($element) {
			    var $sidePanel = $('.aside'),
			        $logoHolder = $('.aside .logo-holder'),
			        $elementToBeScrolledTo = $element.closest('.aside-report');

                if (!_.isEmpty($elementToBeScrolledTo)) {
                    if (isElementBelowViewport($elementToBeScrolledTo, $sidePanel)) {
                        scrollPageDown($elementToBeScrolledTo, $sidePanel, $logoHolder);
                    } else if (isElementAboveViewport($elementToBeScrolledTo, $logoHolder)) {
                        scrollPageUp($elementToBeScrolledTo, $sidePanel);
                    }
                }
			}

            function scrollPageUp($element, $sidePanel) {
                $sidePanel.scrollTop($sidePanel.scrollTop() + $element.position().top + $element.height() - $sidePanel.outerHeight());
            }

            function scrollPageDown($element, $sidePanel, $logoHolder) {
                $sidePanel.scrollTop($sidePanel.scrollTop() + $element.position().top - $logoHolder.height());
            }

			function isElementBelowViewport($element, $sidePanel) {
			    return $sidePanel.outerHeight() < $element.offset().top + $element.height();
			}

			function isElementAboveViewport($element, $logoHolder) {
			    return $element.offset().top - $logoHolder.height() < 0;
			}

			function toggleNextTest(currentTest) {
				$(currentTest).nextAll('.aside-report:not(.is-hidden)')
					.first()
					.find('.test-name')
					.click();
			}

			function ifRootPage(url, type) {
				return url.search(type) > 0;
			}

			function selectItemIfRoot(position) {
				var itemLocation, item;
				switch (position) {
					case 'last' :
						itemLocation = $('.aside-report:not(.is-hidden)').find('.test-name').last().attr('data-url');
						item = findCurrentTest(itemLocation);
						item.find('.test-name').parents('.aside-report').addClass('is-expanded');
						item.find('.test-url').click();
						break;
					case 'first':
						itemLocation = $('.aside-report:not(.is-hidden)').find('.test-name').first().attr('data-url');
						item = findCurrentTest(itemLocation);
						item.find('.test-name').click();
						break;
				}
			}

			function findPreviousTest(currentLocation) {
				return $('a[data-url="' + currentLocation + '"]')
					.parent()
					.prevAll('.aside-report:not(.is-hidden)')
					.filter(':first');
			}

			function findCurrentTest(currentLocation) {
				return $('a[data-url="' + currentLocation + '"]').parent('.aside-report');
			}
		}
	}
});
