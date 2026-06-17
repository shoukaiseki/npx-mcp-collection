# 1
帮我增加几个工具

-- 查询有效的站点和组织 siteid,orgid
select * from site where ACTIVE=1;

-- 查询有效的用户
select * from person where status='ACTIVE'

-- 查询有效的主项目 item
select * from item where ((status != 'OBSOLETE' AND itemsetid = 'ITEMSET')) AND (itemtype in (select value from synonymdomain where domainid='ITEMTYPE' and maxvalue = 'ITEM'))

-- 查询当前库存信息
select * from INVENTORY

-- 库存余量 itemnum,LOCATION,SITEID关联库存
select * from INVBALANCES;

-- 库存批次 itemnum,LOCATION,SITEID关联库存
select * from INVLOT;


# 2

-- 供应商
select * from COMPANIES;