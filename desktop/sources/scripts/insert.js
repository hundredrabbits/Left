function Insert()
{
  this.start = function()
  {
    left.controller.set("insert");
  }

  this.time = function()
  {
    left.inject(new Date().toLocaleTimeString()+" ")
  }

  this.date = function()
  {
    var date = new Date()
    var strArray=['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = date.getDate();
    var m = strArray[date.getMonth()];
    var y = date.getFullYear();
    var s = '' + (d <= 9 ? '0' + d : d) + '-' + m + '-' + y;
    left.inject(s+" ")
  }

  this.path = function()
  {
    if(left.project.paths.length == 0){ return; }
    
    left.inject(left.project.paths[left.project.index]);
  }

  this.stop = function()
  {
    left.controller.set("default");
    left.refresh();
  }
}