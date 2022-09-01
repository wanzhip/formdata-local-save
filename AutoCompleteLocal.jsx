import { AutoComplete } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './localHistory.less';

/**
 * 带本地存储的AutoComplete组件
 * placeholder
 * localStorageName 本地存储的名字
 * ref 接收一个useRef
 * @param param0 
 * @param ref 
 * @returns 
 */

const LOCALARR_LIMIT = 5; // 本地缓存数
const AutoCompleteLocal = ({ placeholder, localStorageName }, ref) => {

    const [showHistory, setShowHistory] = useState<boolean>(false); // 是否展示本地记录
    const [localDataArr, setLocalDataArr] = useState([]); // 本地记录
    const [value, setValue] = useState<string[]>([]);

    useEffect(() => {
        const localHistory = localStorage.getItem(localStorageName) ? JSON.parse(localStorage.getItem(localStorageName)) : [];
        if (localHistory.length > 0) {
            setLocalDataArr(localHistory);
        };
    }, []);

    const onChange = (val) => {
        setValue(val);
    };

    const handleFocus = () => {
        setShowHistory(true);
    };

    const onClickHistory = (item, index) => {
        const arr = item.split(',');
        if (arr.length > 0) {
            setValue(arr);
        }
    };

    const handleBlur = (e) => {
        if (e.target.value) {
            const arr = [...value, e.target.value];
            setValue(arr);
        }
        setTimeout(() => {
            setShowHistory(false);
        }, 200);
    };

    useImperativeHandle(ref, () => ({
        updateCache() {
            if (value.length > 0 && localDataArr.indexOf(value.join()) === -1) {
                // 大于5条 小于5条 是否已存在
                if (localDataArr.length >= LOCALARR_LIMIT) {
                    setLocalDataArr((prev) => {
                        prev.pop();
                        localStorage.setItem(localStorageName, JSON.stringify([value.join(), ...prev]));
                        return [value.join(), ...prev];
                    });
                } else {
                    setLocalDataArr((prev) => {
                        prev.unshift(value.join());
                        localStorage.setItem(localStorageName, JSON.stringify(prev));
                        return prev;
                    });
                }
            }
        },
        value,
        setValue
    }));

    return (
        <>
            <AutoComplete
                popLayer={{ className: 'not-show' }}
                placeholder={placeholder}
                multiple
                tokenSeparators=","
                onChange={onChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                value={value}
            />
            {showHistory && localDataArr.length > 0 &&
                <ul className="history">
                    {localDataArr.map((item, index) => {
                        return (
                            <li
                                key={`${localStorageName}${index}`}
                                className={item === value ? 'activeColor' : ''}
                                onClick={() => onClickHistory(item, index)}>
                                {item}
                            </li>
                        )
                    })}
                </ul>
            }
        </>
    )
}

export default forwardRef(AutoCompleteLocal);