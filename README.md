# LMQ
a lean message queue

## General
allow a task enqueue, when the task perform completely, the callback that is provided
invoked, then dequeue a next task util the queue is empty

## Example:
taskQueue.enqueue(readFile,{args:[para1, para2], priority: 1, context:self}, callback)

## API:
##constructor(concurrency)
concurrency: (number=)
             MQ,s allow you to run tasks parallel
##.enqueue(fn, options, cb)
###Parameters:
fn:          (function=) 
             the task wanna limited
options:     (object=)   
             properties:
             args:       (array=)      task,s arguments
             priority:   (number=)     task,s priority
             context:    (object=)     task,s context
args:        (array=)    
             the task,s args
cb:          (fn=)       
             the task,s callback
###Returns:
null