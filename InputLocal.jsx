import { Input } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './localHistory.less';

/**
 * 带本地存储的input组件
 * placeholder
 * onPressEnter 回车事件
 * localStorageName 本地存储的名字
 * ref 接收一个useRef
 * @param param0 
 * @param ref 
 * @returns 
 */

const LOCALARR_LIMIT = 5; // 本地缓存数
const LocalInput = ({ placeholder, onPressEnter, localStorageName }, ref) => {
    
    const [showHistory, setShowHistory] = useState<boolean>(false); // 是否展示本地记录
    const [localDataArr, setLocalDataArr] = useState([]); // 本地记录
    const [value, setValue] = useState('');
    
    useEffect(() => {
        const localHistory = localStorage.getItem(localStorageName) ? JSON.parse(localStorage.getItem(localStorageName)) : [];
        if (localHistory.length > 0) {
            setLocalDataArr(localHistory);
        };
    }, []);

    const onChange = (e) => {
        setValue(e.target.value);
    };

    const handleFocus = () => {
        setShowHistory(true);
    };

    const onClickHistory = (item, index) => {
        setValue(item);
    };

    const handleBlur = () => {
        setTimeout(() => {
            setShowHistory(false);
        }, 200);
    };

    useImperativeHandle(ref, () => ({
        updateCache() {
            if (value && localDataArr.indexOf(value) === -1) {
                // 大于5条 小于5条 是否已存在
                if (localDataArr.length >= LOCALARR_LIMIT) {
                    setLocalDataArr((prev) => {
                        prev.pop();
                        localStorage.setItem(localStorageName, JSON.stringify([value, ...prev]));
                        return [value, ...prev];
                    });
                } else {
                    setLocalDataArr((prev) => {
                        prev.unshift(value);
                        localStorage.setItem(localStorageName, JSON.stringify(prev));
                        return prev;
                    });
                }
            }
        },
        value,
        setValue
    }))

    return(
        <>
            <Input
                value={value}
                onPressEnter={onPressEnter}
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={placeholder} />
                {showHistory && localDataArr.length > 0 &&
                    <ul className="history">
                        {localDataArr.map((item, index) => {
                            return (
                                <li
                                    key={index}
                                    className={item === value ? 'activeColor' : ''}
                                    onClick={() => onClickHistory(item, index)}
                                    >
                                    {item}
                                </li>
                            )
                        })
                    }
                    </ul>
                }
        </>
    )
}

export default forwardRef(LocalInput);