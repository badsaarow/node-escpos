const escpos = require('..');
const assert = require('assert');

describe('Arduino serial test', function() {

  it('device#write', function(done){
    var device = new escpos.Console((data) => {
      console.log(data);
      assert.equal(data.length, 3);
      done();
    });
    device.write(Buffer.alloc(3));
  })

  it('arduino#write', function(done){
    var device = new escpos.Console((data) => {
      assert.deepEqual(data, Buffer.from('hello world'));
      done();
    });
    var arduino = new escpos.Arduino(device);
    arduino.print('hello world').flush();
  })

  it('arduino#serial write', function(done){
    // promise는 bt와 usb device만 적용되어 있어, serial은 callback으로 처리해야 한다.
    const port = new escpos.Serial('COM18');
    const arduino = new escpos.Arduino(port);

    port.open(err => {
      if (err) {
        console.error(err);
        assert.fail();
      }

      console.log('port opened');
      arduino.print('hello my printer\n');
      arduino.flush();
      arduino.close(() => {
        done();
      });
    })
  })

  it('arduino#serial write repeat', function(done){
    const sensorData = {
      power: 'on',
      direction: 'up'
    }

    const port = new escpos.Serial('COM18');
    const arduino = new escpos.Arduino(port);

    port.open(err => {
      if (err) {
        console.error(err);
        assert.fail();
      }

      console.log('port opened');
      for (let i = 0; i < 30; i++ ) {
        arduino.print(JSON.stringify(sensorData) + '\n');
      }
      arduino.flush();
      arduino.close(() => {
        done();
      });
    })
  })
});
