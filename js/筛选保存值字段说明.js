{
    "account": "string",
    "conf": "每个筛选包含字段，
    select|selectMul-{ 
    "joinColumn":"city_id", //父筛选关联的字段
    "filterColumn":"city_name", //where条件过滤的,模糊匹配的字段
    "defaultValue":"all|first", //默认展示全部或者第一条
    "dataSourceId":"1",//数据源ID
    "content":"select distinct area as name,area as text from fact_air_cn",//sql条件
    "required":false,//是否必须
    "autoComplete":false,//如果展示条数为空,则为true,否则为false,为true时,前端展示所有值,模糊搜索也在前端进行
    "queryLimit":1000, //展示条数
    "selectMax":10,//最大选择行数
    "selectMin":1  //最少选择行数
  },
    "id": 0,
    "isPrivate": 1, //默认传1 
    "name": "string", //筛选名称
    "parentId": 0, //父筛选ID
    "status": 0, //筛选状态.启用,删除等状态
    "pathName": "string",//路径名称 类似"0-1"
    "type": "筛选类型包含值，select-下拉单选，selectMul-下来多选",
    "updateTime": {
        "date": 0,
        "day": 0,
        "hours": 0,
        "minutes": 0,
        "month": 0,
        "nanos": 0,
        "seconds": 0,
        "time": 0,
        "timezoneOffset": 0,
        "year": 0
    },
    "userId": 0
}