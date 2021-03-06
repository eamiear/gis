/**
 * Created by K on 2017/6/2.
 */

/**
 * 菜单
 * header： 一级菜单名称
 * children： 二级菜单集合
 * title： 二级菜单名称
 * href: demo路径
 */
var menuDatas = [{
    header: '地图示例',
    //href:'',
    children: [{
          title: '地图展示',
          href: 'views/basic/a1_0.htm'
      },
      {
          title: '移动地图',
          href: 'views/basic/a1_1.htm'
      },
      {
        title: '缩放地图',
        href: 'views/basic/a1_2.htm'
      },
      {
        title: '设置地图显示范围',
        href: 'views/basic/a1_3.htm'
      },
      {
        title: '获取地图显示范围',
        href: 'views/basic/a1_4.htm'
      }
    ]
  },{
    header: '工具',
    children: [{
      title: '添加点',
      href: 'views/toolbar/addpint.html'
    },{
      title: '添加图片',
      href: 'views/toolbar/t_1.html'
    },{
      title: '绘制图元',
      href: 'views/toolbar/t_1.htm'
    },{
      title: '绘制图元',
      href: 'views/toolbar/t_1.htm'
    }]
  },
  {
    header: '工具条',
    //href:'',
    children: [{
      title: 'tester',
      href: 'views/toolbar/t_0.html'
    }]
  },
  {
      header: '地图操作示例',
      //href:'',
      children: [{
          title: '地图基本操作',
          href: 'views/demo/e1_1.htm'
      },{
        title: '地图测距、测面操作',
        href: 'views/demo/e1_2.htm'
      }]
  },
  {
      header: '地图控件示例',
      //href:'',
      children: [{
          title: '添加/删除工具条、比例尺控件',
          href: 'views/demo/b0_2.htm'
      },{
        title: '地图图层切换',
        href: 'views/demo/b0_3.htm'
      }]
  },
  {
      header: '覆盖物示例',
      //href:'',
      children: [{
          title: '添加/删除覆盖物',
          href: 'views/demo/c1_1.htm'
      },{
        title: '手动绘制/删除覆盖物',
        href: 'views/demo/c1_2.htm'
      }]
  },
  {
      header: '信息窗口示例',
      //href:'',
      children: [{
          title: '添加纯文字的信息窗口',
          href: 'views/demo/d0_1.htm'
      },{
        title: '添加自定义属性信息窗口',
        href: 'views/demo/d0_2.htm'
      },{
        title: '添加图文组合的信息窗口',
        href: 'views/demo/d0_6.htm'
      },{
        title: '添加视频展示信息窗口',
        href: 'views/demo/d0_4.htm'
      }]
  },
  {
    header: '定位示例',
    //href:'',
    children: [{
      title: '定位接口',
      href: 'views/demo/i8_1.htm'
    }]
  },
  {
    header: '定制开发功能',
    //href:'',
    children: [{
      title: '聚合展示',
      href: 'views/demo/f0_1.htm'
    },{
      title: '带箭头(动画)轨迹展示',
      href: 'views/demo/f0_2.htm'
    }]
  }
];
