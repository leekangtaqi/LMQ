/**
 * a lean concurrent queue
 * @param concurrency allow tasks,s concurrency
 * @constructor
 */
function LMQ(concurrency){
    this.queue = [];
    this.busy = false;
    this.concurrency = concurrency;
    this._currentTask = null;
    this._inboundTask = null;
    this._outboundTask = null;
}

/**
 * allow a task enqueue, when the task perform completely, the callback that is provided
 * invoked, then dequeue a next task util the queue is empty
 * example: myQueue.enqueue(function task(cb){ cb() }, {args: [], context: xxx, priority: 1}, callback);
 * @param task      receive a task(function) to be executed
 * @param options   options contain a args and a context, both of them are optional
 * if they are provided, they should correspond with the input of task function
 * @param callback  task,s callback, follow Node.js style
 * @return {LMQ}
 */
LMQ.prototype.enqueue = function(task, options, callback){
    var callback = callback || function(){};
    var taskWrapper = {
        task: task,
        callback: callback,
        args: options && options.args || null,
        context: options && options.context
    };
    options && options.priority && this.queue.unshift(taskWrapper) || this.queue.push(taskWrapper);
    if(!this.busy){
        this.busy = true;
        this.next();
    }
    return this;
};

/**
 * tasks executor
 * @returns {*}
 */
LMQ.prototype.next = function(){
    var self = this;
    self._inboundTask = self._currentTask;
    var taskWrapper = this.queue.shift();
    self._currentTask = taskWrapper;
    self._outboundTask = self.queue.slice(1, 1)[0];
    var nextArgs = [];
    var taskCallback = function(err, data){
        if(self.queue.length <= 0){
            self.busy = false;
            return taskWrapper.callback(err, data);
        }
        taskWrapper.callback(err, data);
        self.next();
    };
    nextArgs.push(taskCallback);
    if(taskWrapper.args){
        nextArgs = taskWrapper.args.concat(nextArgs);
        return taskWrapper.task.apply(taskWrapper.context, nextArgs);
    }
    taskWrapper.task(taskCallback);
};

/**
 * allow the queue empty
 * @returns {LMQ}
 */
LMQ.prototype.flush = function() {
    this.queue = [];
    return this;
};

/**
 * obtain inbound task
 * @returns {null|T|*|taskWrapper}
 */
LMQ.prototype.getInbound = function(){
    return this._inboundTask || null;
};

/**
 * obtain oubound task
 * @returns {null|T|taskWrapper}
 */
LMQ.prototype.getOutbound = function(){
    return this._outboundTask || null;
};

/**
 * obtain the current task
 * @returns {null|T|*|taskWrapper}
 */
LMQ.prototype.getOccupant = function(){
    return this._currentTask || null;
};

/**
 * obtain all tasks in Queue
 * @returns {Array}
 */
LMQ.prototype.getQueueList = function(){
    return this.queue;
};
module.exports = LMQ;