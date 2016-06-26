/**
 * Created by Shahin on 6/30/2015.
 */

define(['application-configuration'], function (app) {

    app.register.factory('ViewByAttributeDataFactory', ['$rootScope', 'Notify', 'dataFactory',
        function ($rootScope, Notify, dataFactory) {

            var preparedViewByAttribute = [];

            var ViewByAttributeIcons = {
                GEO: "fa fa-globe fa-2x",
                ORGANIZATION: "fa fa-users fa-2x",
                TICKET: "fa fa-exclamation-triangle fa-2x",
                OTHER: "fa fa-dot-circle-o fa-2x"
            };

            var CustomAttribute = function (data) {
                this.Id = data.Id;
                this.Label = data.Label;
                this.Index = data.Index;
                this.Type = data.Type;
                this.DisplayOrder = data.DisplayOrder;
                this.IsDefault = data.IsDefault;
                this.AttributeCount = data.AttributeCount;
                this.setAttributeCount = function (val) {
                    this.AttributeCount = val;
                };
            };

            var ViewByAttribute = function (type, groupName, isTck, icon, items, displayOrder) {
                this.Type = type;
                this.GroupName = groupName;
                this.IsTck = isTck;
                this.GroupImageURI = icon;
                this.Items = prepareCustomAttributedata(items);
                //prepareCustomAttribute(items);
                this.DisplayOrder = displayOrder;
            };

            function prepareCustomAttributedata(data) {
                var tmpColl = [];
                _.forEach(data, function (n, key) {
                    var oCustomAttribute = CreateObject.CustomAttribute(n);
                    tmpColl.push(oCustomAttribute);
                });
                return tmpColl;
            }

            function prepareViewByAttributeCollection(data) {
                var categoryType = [];
                var preparedCategorizedAttributeColl = _.groupBy(data, function (item) {
                    //categoryType.push({name: item.Type});
                    var key = {};
                    if (item.Type === 0) {
                        key = 'GEO';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type, displayOrder: 1});
                        }
                        return key;
                    }
                    else if (item.Type === 1) {
                        key = 'ORGANIZATION';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type, displayOrder: 0});
                        }
                        return key;
                    }
                    else if (item.Type === 2) {
                        key = 'TICKET';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type, displayOrder: 3});
                        }
                        return key;
                    }
                    else if (item.Type === 3) {
                        key = 'OTHER';
                        if (!_.findKey(categoryType, {name: key})) {
                            categoryType.push({name: key, type: item.Type, displayOrder: 2});
                        }
                        return key;
                    }
                });

                _.forEach(preparedCategorizedAttributeColl, function (n, key) {
                    var sortedColl = _.sortByOrder(n, 'DisplayOrder', true);
                    //var catType = _.findKey(categoryType, {name: key});
                    var oCategory = _.find(categoryType, {name: key});

                    var oViewByAttribute = CreateObject.ViewByAttribute(oCategory.type, key, key === 'TICKET', ViewByAttributeIcons[key], sortedColl, oCategory.displayOrder);
                    preparedViewByAttribute.push(oViewByAttribute);
                });

                //return preparedViewByAttribute;
                //var categorizedAttributeColl = _.sortByOrder(preparedCategorizedAttributeColl, 'type', true);
                //var tmp = _.sortByOrder(preparedViewByAttribute, 'DisplayOrder', true);
                preparedViewByAttribute = _.sortByOrder(preparedViewByAttribute, 'DisplayOrder', true);
                //return _.sortByOrder(preparedViewByAttribute, 'DisplayOrder', true);
            }

            var CreateObject = {
                CustomAttribute: function (data) {
                    return new CustomAttribute(data);
                },
                ViewByAttribute: function (type, groupName, isTck, icon, data, displayOrder) {
                    return new ViewByAttribute(type, groupName, isTck, icon, data, displayOrder);
                }
            };

            return {
                prepareViewByAttributeData: function () {
                    preparedViewByAttribute = [];
                    prepareViewByAttributeCollection(dataFactory.CustomAttributeCollection());
                },
                getPreparedViewByAttributeData: function () {
                    return preparedViewByAttribute;
                }

            };


        }]);
});

