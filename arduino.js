'use strict';
const util = require('util');
const { MutableBuffer } = require('mutable-buffer');
const EventEmitter = require('events');
const utils = require('./utils');
const _ = require('./commands');
const Promiseify = require('./promiseify');

/**
 * [function Arduino]
 * @param  {[Adapter]} adapter [eg: usb, network, or serialport]
 * @return {[Arduino]} arduino  [the arduino instance]
 */
function Arduino(adapter, options) {
  if (!(this instanceof Arduino)) {
    return new Arduino(adapter);
  }
  var self = this;
  EventEmitter.call(this);
  this.adapter = adapter;
  this.options = options;
  this.buffer = new MutableBuffer();
  this.recvBuffer = null;

  this.adapter.on('message', (data) => {
    //console.log('arduino message', data.toString(), data)
    if (this.recvBuffer) {
      this.recvBuffer = Buffer.concat([this.recvBuffer, data])
    } else {
      this.recvBuffer = Buffer.from(data)
    }
    //console.log('arduino message', this.recvBuffer.toString(), this.recvBuffer[this.recvBuffer.length-1], this.recvBuffer)
    const lfIdx = this.recvBuffer.indexOf(10)
    if (lfIdx === -1) return
    const recv = this.recvBuffer.slice(0, lfIdx+1)
    this.emit('message', recv)
    this.recvBuffer = this.recvBuffer.slice(lfIdx+1)
    if (this.recvBuffer[this.recvBuffer.length-1] === 10) {
      this.emit('message', recv)
      this.recvBuffer = null
    }
    
  })
}

Arduino.create = function (device) {
  const printer = new Arduino(device);
  return Promise.resolve(Promiseify(printer))
};

/**
 * Printer extends EventEmitter
 */
util.inherits(Arduino, EventEmitter);


/**
 * [function print]
 * @param  {[String]}  content  [mandatory]
 * @return {[Arduino]} printer  [the Arduino instance]
 */
Arduino.prototype.print = function (content) {
  this.buffer.write(content);
  return this;
};
/**
 * [function print pure content with End Of Line]
 * @param  {[String]}  content  [mandatory]
 * @return {[Arduino]} printer  [the Arduino instance]
 */
Arduino.prototype.println = function (content) {
  return this.print(content + _.EOL);
};


/**
 * Send data to hardware and flush buffer
 * @param  {Function} callback
 * @return {[Arduino]} printer  [the Arduino instance]
 */
Arduino.prototype.flush = function (callback) {
  var buf = this.buffer.flush();
  this.adapter.write(buf, callback);
  return this;
};


/**
 * [close description]
 * @param  {Function} callback [description]
 * @param  {[type]}   options  [description]
 * @return {[type]}            [description]
 */
Arduino.prototype.close = function (callback, options) {
  var self = this;
  return this.flush(function () {
    self.adapter.close(callback, options);
  });
};

/**
 * [writes a low level command to the printer buffer]
 *
 * @usage
 * 1) raw('1d:77:06:1d:6b:02:32:32:30:30:30:30:32:30:30:30:35:30:35:00:0a')
 * 2) raw('1d 77 06 1d 6b 02 32 32 30 30 30 30 32 30 30 30 35 30 35 00 0a')
 * 3) raw(Buffer.from('1d77061d6b0232323030303032303030353035000a','hex'))
 *
 * @param data {Buffer|string}
 * @returns {Arduino}
 */
Arduino.prototype.raw = function raw(data) {
  if (Buffer.isBuffer(data)) {
    this.buffer.write(data);
  } else if (typeof data === 'string') {
    data = data.toLowerCase();
    this.buffer.write(Buffer.from(data.replace(/(\s|:)/g,''), 'hex'));
  }
  return this;
};

/**
 * [exports description]
 * @type {[type]}
 */
module.exports = Arduino;
