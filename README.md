# @soften/hooks
业务类型 React Hooks 钩子
## useOnChangeValue
- 同时兼备 value 和 onChange 函数的集合钩子
- 可简化使用受控组件的步骤，少去 useState 和 onChange 函数定义的步骤

```ts
  import { useOnChangeValue } from '@soften/hooks'
  function App() {
    const [state] = useOnChangeValue('');
    /**
      如果修改值的过程还需要进行一次转换的话
      可向 useOnChangeValue 的第二个参数传递转换函数
      例如，返回的值就是新值
      useOnChangeValue('', (event) => event.target.value)
    **/
    return (
      <input {...state} />
    )
  }
  ```

## useWithResolvers
- 如果在一次列表操作中，需要有一些类似于弹窗的功能
- 如果其中任意一个有着需要等待的操作，那么后续的列表需要等待前一个完成才能循环下去
- 首先编写一个对话框组件，配合上 useWithResolvers 封装，再借助 antd 的 Model 简化一下

```tsx 
import { Modal } from "antd";
import { useWithResolvers } from "@soften/hooks"
import { useImperativeHandle, forwardRef, useState } from 'react'

const Dialog = forwardRef((props, ref) => {
  const {
    promise,
    resolve,
    reject,
  } = useWithResolvers();

  const [open, setOpen] = useState(false)

  useImperativeHandle(ref, () => ({
    onOpen: () => {
      setOpen(true);
      return promise.then((resolve) => {
        setOpen(false);
        return resolve;
      });
    },
  }))

  return (
    <Modal open={open} onOk={() => {
      resolve('OK');
    }}>
      示范
    </Modal>
  )
})

export default Dialog;

```

```tsx
  import { useWithResolvers } from '@soften/hooks'
  import { useRef } from 'react';
  function App () {
    const list = [
        1,
        2,
        3,
        4
      ];
    const ref = useRef(null);

  return (
    <div>
      <Button onClick={
        async () => {
          /**
           * 假设可以被 2 取余等于0就调起对话窗口进行操作
           * 然后把返回的值放入新数组里，否则就把原值放到新数组里
           */
          const array = [];
          for (const int of list) {
            if (int % 2 === 0) {
              const value = await ref?.current?.onOpen?.();
              array.push(value);
            } else {
              array.push(int)
            }
          }
          console.log(array);
        }
      }>测试</Button>
      <Dialog ref={ref} />
      </div >
    )
  }
```

- 最后结果

```ts
[1, 'OK', 3, 'OK']
```

- 因为 2 和 4 可以被 2 取余等于0，触发对话框，然后在点击确定的时候通过 resolve 函数传递参数，并且通过 proimes 把收到的参数给外部，达到从打开到收参都只用一个函数的目的

```ts

const {
  proimes,
  resolve,
  reject
} = useWithResolvers();

// 本身是一个异步函数，所以 proimes 必须得等到 resolve 或 reject 调用才会结束该异步函数

```
