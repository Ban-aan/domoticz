define(['app', 'RefreshingChart', 'log/factories'], function (app, RefreshingChart) {

    app.component('deviceTemperatureLog', {
        bindings: {
            device: '<',
        },
        templateUrl: 'app/log/TemperatureLog.html',
        controller: function() {
            const $ctrl = this;
            $ctrl.autoRefresh = true;

            $ctrl.$onInit = function() {
                $ctrl.deviceIdx = $ctrl.device.idx;
                $ctrl.deviceType = $ctrl.device.Type;
                $ctrl.degreeType = $.myglobals.tempsign;
            }
        }
    });

    const degreeSuffix = '\u00B0' + $.myglobals.tempsign;

    app.directive('temperatureShortChart', function () {
        return {
            require: {
                logCtrl: '^deviceTemperatureLog'
            },
            scope: {
                device: '<',
                degreeType: '<'
            },
            template: ''
                + '<div class="chart">'
                + '  <h2 ng-bind="vm.chartTitle"></h2>'
                + '  <div class="chartarea">'
                + '    <button class="zoom1h" ng-click="zoom1h()">1h</button>'
                + '    <button class="zoom3h" ng-click="zoom3h()">3h</button>'
                + '    <button class="zoom1d" ng-click="zoom1d()">1d</button>'
                + '    <button class="zoom3d" ng-click="zoom3d()">3d</button>'
                + '    <button class="zoomreset" ng-click="zoomreset()">reset</button>'
                + '    <div class="chartcontainer"></div>'
                + '  </div>'
                + '</div>',
            replace: true,
            transclude: true,
            bindToController: true,
            controllerAs: 'vm',
            controller: function ($location, $route, $scope, $element, domoticzGlobals, domoticzApi, domoticzDataPointApi) {
                const self = this;
                self.chartTitle = domoticzGlobals.Get5MinuteHistoryDaysGraphTitle();
                self.range = 'day';
                self.sensorType = 'temp';

                $scope.zoom1h = function() {
                    const xAxis = self.chart.chart.xAxis[0];
                    xAxis.zoom(xAxis.dataMax - 1*3600*1000, xAxis.dataMax);
                    self.chart.chart.redraw();
                }

                $scope.zoom3h = function() {
                    const xAxis = self.chart.chart.xAxis[0];
                    xAxis.zoom(xAxis.dataMax - 3*3600*1000, xAxis.dataMax);
                    self.chart.chart.redraw();
                }

                $scope.zoom1d = function() {
                    const xAxis = self.chart.chart.xAxis[0];
                    xAxis.setExtremes(xAxis.dataMax - 1*24*3600*1000, xAxis.dataMax);
                    self.chart.chart.redraw();
                }

                $scope.zoom3d = function() {
                    const xAxis = self.chart.chart.xAxis[0];
                    xAxis.setExtremes(xAxis.dataMax - 3*24*3600*1000, xAxis.dataMax);
                    self.chart.chart.redraw();
                }

                $scope.zoomreset = function() {
                    const xAxis = self.chart.chart.xAxis[0];
                    xAxis.zoom(xAxis.dataMin, xAxis.dataMax);
                    self.chart.chart.redraw();
                }

                self.$onInit = function() {
                    self.chart = new RefreshingChart(
                        baseParams($),
                        angularParams($location, $route, $scope, $element),
                        domoticzParams(domoticzGlobals, domoticzApi, domoticzDataPointApi),
                        chartParams(
                            domoticzGlobals,
                            self,
                            domoticzGlobals.Get5MinuteHistoryDaysGraphTitle(),
                            true,
                            function (dataItem, yearOffset=0) {
                                return GetLocalDateTimeFromString(dataItem.d, yearOffset);
                            },
                            [
                                {
                                    id: 'temperature',
                                    name: 'Temperature',
                                    dataItemIsValid: function (dataItem) {
                                        return dataItem.te !== undefined;
                                    },
                                    valuesFromDataItem: [
                                        function (dataItem) {
                                            return dataItem.te;
                                        }
                                    ],
                                    template: {
                                        color: 'yellow',
                                        yAxis: 0,
                                        tooltip: {
                                            valueSuffix: ' ' + degreeSuffix,
                                            valueDecimals: 1
                                        }
                                    }
                                },
                                {
                                    id: 'humidity',
                                    name: 'Humidity',
                                    dataItemIsValid: function (dataItem) {
                                        return dataItem.hu !== undefined;
                                    },
                                    valuesFromDataItem: [
                                        function (dataItem) {
                                            return dataItem.hu;
                                        }
                                    ],
                                    template: {
                                        color: 'lime',
                                        yAxis: 1,
                                        tooltip: {
                                            valueSuffix: ' %',
                                            valueDecimals: 0
                                        }
                                    }
                                }
                            ]
                        )
                    );
                };
            }
        }
    });

    function baseParams(jquery) {
        return {
            jquery: jquery
        };
    }
    function angularParams(location, route, scope, element) {
        return {
            location: location,
            route: route,
            scope: scope,
            element: element
        };
    }
    function domoticzParams(globals, api, datapointApi) {
        return {
            globals: globals,
            api: api,
            datapointApi: datapointApi
        };
    }
    function chartParams(domoticzGlobals, ctrl, chartTitle, isShortLogChart, timestampFromDataItem, seriesSuppliers) {
        return {
            range: ctrl.range,
            device: ctrl.device,
            sensorType: ctrl.sensorType,
            chartTitle: $.t('Temperature') + ' ' + chartTitle,
            autoRefreshIsEnabled: function() { return ctrl.logCtrl.autoRefresh; },
            dataSupplier: {
                yAxes:
                    [
                        {
                            title: {
                                text: $.t('Degrees') + ' \u00B0' + ctrl.degreeType
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + '\u00B0 ' + ctrl.degreeType;
                                }
                            }
                        },
                        {
                            title: {
                                text: $.t('Humidity') + ' %'
                            },
                            labels: {
                                formatter: function () {
                                    return this.value + '%';
                                }
                            },
                            showEmpty: false,
                            allowDecimals: false,	//no need to show scale with decimals
                            ceiling: 100,			//max limit for auto zoom, bug in highcharts makes this sometimes not considered.
                            floor: 0,				//min limit for auto zoom
                            minRange: 10,			//min range for auto zoom
                            opposite: true
                        }
                    ],
                timestampFromDataItem: timestampFromDataItem,
                isShortLogChart: isShortLogChart,
                seriesSuppliers: seriesSuppliers
            }
        };
    }

    app.directive('temperatureLogChart', function () {
        return {
            scope: {
                deviceIdx: '<',
                deviceType: '<',
                degreeType: '<',
                range: '@'
            },
            replace: true,
            template: '<div style="height: 300px;"></div>',
            bindToController: true,
            controllerAs: 'vm',
            controller: function ($scope, $element, $route, domoticzGlobals, domoticzApi, domoticzDataPointApi) {
                var vm = this;
                var chart;

                vm.$onInit = init;
                vm.$onChanges = onChanges;

                function init() {
                    chart = $element
                        .highcharts({
                            chart: {
                                type: getChartType(),
                                zoomType: 'x',
                                resetZoomButton: {
                                    position: {
                                        x: -30,
                                        y: -36
                                    }
                                }
                            },
                            xAxis: {
                                type: 'datetime'
                            },
                            yAxis: [{ //temp label
                                labels: {
                                    formatter: function () {
                                        return this.value + '\u00B0 ' + vm.degreeType;
                                    }
                                },
                                title: {
                                    text: $.t('Degrees') + ' \u00B0' + vm.degreeType
                                }
                            }, { //humidity label
                                showEmpty: false,
                                allowDecimals: false,	//no need to show scale with decimals
                                ceiling: 100,			//max limit for auto zoom, bug in highcharts makes this sometimes not considered.
                                floor: 0,				//min limit for auto zoom
                                minRange: 10,			//min range for auto zoom
                                labels: {
                                    formatter: function () {
                                        return this.value + '%';
                                    }
                                },
                                title: {
                                    text: $.t('Humidity') + ' %'
                                },
                                opposite: true
                            }],
                            tooltip: {
                                crosshairs: true,
                                shared: true
                            },
                            plotOptions: {
                                series: {
                                    point: {
                                        events: {
                                            click: function (event) {
                                                if (event.shiftKey != true) {
                                                    return;
                                                }

                                                domoticzDataPointApi
                                                    .deletePoint(vm.deviceIdx, event.point, vm.range === 'day')
                                                    .then(function () {
                                                        $route.reload();
                                                    });
                                            }
                                        }
                                    }
                                },
                                spline: {
                                    lineWidth: 3,
                                    states: {
                                        hover: {
                                            lineWidth: 3
                                        }
                                    },
                                    marker: {
                                        enabled: false,
                                        states: {
                                            hover: {
                                                enabled: true,
                                                symbol: 'circle',
                                                radius: 5,
                                                lineWidth: 1
                                            }
                                        }
                                    }
                                },
								line: {
									lineWidth: 3,
									states: {
										hover: {
											lineWidth: 3
										}
									},
									marker: {
										enabled: false,
										states: {
											hover: {
												enabled: true,
												symbol: 'circle',
												radius: 5,
												lineWidth: 1
											}
										}
									}
								},
                                areasplinerange: {
                                    marker: {
                                        enabled: false
                                    }
                                }
                            },
                            title: {
                                text: getChartTitle()
                            },
                            legend: {
                                enabled: true
                            }
                        })
                        .highcharts();

                    refreshChartData();
                }

                function onChanges(changesObj) {
                    if (!chart) {
                        return;
                    }

                    if (changesObj.deviceIdx || changesObj.range) {
                        refreshChartData();
                    }

                    if (changesObj.deviceType) {
                        chart.setTitle({text: getChartTitle()});
                    }
                }

                function refreshChartData() {
                    domoticzApi
                        .sendRequest({
                            type: 'graph',
                            sensor: 'temp',
                            range: vm.range,
                            idx: vm.deviceIdx
                        })
                        .then(function (data) {
                            if (typeof data.result != 'undefined') {
                                AddDataToTempChart(data, chart, vm.range === 'day' ? 1 : 0, (vm.deviceType === 'Thermostat'));
                                chart.redraw();
                            }
                            chart.yAxis[1].visibility = vm.range !== 'day';
                        });
                }

                function getChartType() {
					if (vm.deviceType === 'Thermostat') return 'line';
					return 'spline';
                }

                function getChartTitle() {
                    var titlePrefix = vm.deviceType === 'Humidity'
                        ? $.t('Humidity')
                        : $.t('Temperature');

                    if (vm.range === 'day') {
                        return titlePrefix + ' ' + domoticzGlobals.Get5MinuteHistoryDaysGraphTitle();
                    } else if (vm.range === 'month') {
                        return titlePrefix + ' ' + $.t('Last Month');
                    } else if (vm.range === 'year') {
                        return titlePrefix + ' ' + $.t('Last Year');
                    }
                }
            }
        }
    });
});
