'use strict';
const util          = require('util');
const EventEmitter  = require('events');
const Readline = require('@serialport/parser-readline');

/**
 * SerialPort device
 * @param {[type]} port
 * @param {[type]} options
 */
function Serial(port, options){
  var self = this;
  const SerialPort = require('serialport');
  options = options || { 
    baudRate: 115200,
    autoOpen: false
  };
  this.device = new SerialPort(port, options);
  //const parser = this.device.pipe(new Readline({ delimiter: '\r' }))
  //parser.on('data', console.log)

  this.device.on('close', function() {
    self.emit('disconnect', self.device);
    self.device = null;
  });
  this.device.on('data', function(data) {
    //console.log('serial Data', data.toString(), data);
    self.emit('message', data);
  });
  EventEmitter.call(this);
  return this;
}

util.inherits(Serial, EventEmitter);

/**
 * open deivce
 * @param  {Function} callback
 * @return {[type]}
 */
Serial.prototype.open = function(callback){
  this.device.open(callback);
  return this;
};


/**
 * write data to serialport device
 * @param  {[type]}   buf      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Serial.prototype.write = function(data, callback){
  const res = this.device.write(data, callback);
  //console.log('write', data.toString(), res, data);
  return this;
};

/**
 * close device
 * @param  {Function} callback  [description]
 * @param  {int}      timeout   [allow manual timeout for emulated COM ports (bluetooth, ...)]
 * @return {[type]} [description]
 */
Serial.prototype.close = function(callback, timeout) {

  var self = this;

  this.device.drain(function() {

    self.device.flush(function(err) {

      setTimeout(function() {

        err ? callback && callback(err, self.device) : self.device.close(function(err) {
          self.device = null;
          return callback && callback(err, self.device);
        });

      }, "number" === typeof timeout && 0 < timeout ? timeout : 0);

    });

  });

  return this;

};

/**
 * expose
 */
module.exports = Serial;
