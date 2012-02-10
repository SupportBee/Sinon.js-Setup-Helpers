var SB = {};
SB.Testing = {};

SB.Testing.testWithMocks = function(mocks, test){

  var mockObjects = [];
  var callArgs = [];

  _.each(mocks, function(mock){
    // setup mock
    console.log('times ', mock.times);

    if(mock.times === undefined){
      mock.times = 1
    }

    if(mock.klass === undefined ||
        mock.expects === undefined){
      throw("Need klass and expects");
    }

    var sinonMock = sinon.mock(mock.klass);
    var expectation = sinonMock.expects(mock.expects)

    if(mock.times > 0){
      expectation.exactly(mock.times);
      console.log('expected', mock.times);
    }else{
      console.log('never expected');
      expectation.never();
    }

    
    if(mock.withArgs){
      expectation['withArgs'].apply(expectation, mock.withArgs);
    }

    if(mock.returns){
      expectation.returns(mock.returns);
    }

    mockObjects.push([sinonMock, expectation]);
  });

  test.call();

  _.each(mockObjects, function(mock){
    callArgs.push(mock[1].args);
    mock[0].verify();
    mock[0].restore();
  });

  return callArgs;

};

SB.Testing.createJSONResponse = function(factory_name, count, meta){
  var respArray = []
  _(count).times(function(){
    respArray.push(BackboneFactory.create(factory_name).toJSON()[factory_name])
  });

  var response = {};

  _.extend(response, meta);
  response[factory_name + 's'] = respArray;

  return JSON.stringify(response);
};

SB.Testing.createServer = function(factory_name, count, url, meta){

  var response = SB.Testing.createJSONResponse(factory_name, count, meta);

  
  console.log('createServer Response');
  console.log(meta);
  console.log(response);

  var server = sinon.fakeServer.create();

  server.respondWith("GET", url,
                          [200, { "Content-Type": "application/json" },
                          response
                          ]);

  return server;

};
