import { Select, Tooltip } from 'antd';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import './localHistory.less';
import { cloneDeep } from 'lodash';

/**
 * 带本地存储的Select组件
 * data 数据
 * localStorageName 本地存储的名字
 * ref 接收一个useRef
 * @param param0 
 * @param ref 
 * @returns 
 */
interface IData {
    category: string;
    categoryName: string;
    ckTopic: string;
    client: string;
    esTopic: string;
    hiveTopic: string;
    id: number;
    kafkaTopic: string;
    searchType: number;
}
interface IType {
    localStorageName: string;
    data: IData[];
    name: string;
    handleChangeCallback: (id) => void;
}
const LOCALARR_LIMIT = 3; // 本地缓存数
const LocalSelect = (props: IType, ref) => {
    const { localStorageName, data, name, handleChangeCallback } = props;
    const [value, setValue] = useState(null);
    const [totalData, setTotalData] = useState([]); // Appkey拼接数据用 数据
    const localArrRef = useRef([]); // 本地数据
    
    // 存储传递数据的构造数据类型
    const dataArrRef = useRef([{
        label: `${name}`,
        options: [],
    }]);

    useEffect(() => {
        const localHistory = localStorage.getItem(localStorageName) ? JSON.parse(localStorage.getItem(localStorageName)) : [];
        localArrRef.current = localHistory;

        dataArrRef.current[0].options = [];
        data?.forEach(item => {
            dataArrRef.current[0].options.push({
                id: item.id,
                category: item.category,
                categoryName: item.categoryName ? item.categoryName :  ''
            });
        });
        const total = localHistory.concat(dataArrRef.current);
        setTotalData(total);
    }, [data]);

    const handleSetData = () => {
        setTotalData(localArrRef.current.concat(dataArrRef.current));
    };

    // 处理AppKey
    const handleFilter = (value) => {
        if (!value) {
            handleSetData();
            return;
        };
        let groups = cloneDeep(totalData);
        groups = groups.filter(item => {
            return item.label == `${name}`;
        });
        let newOptions = groups[0].options.filter(option => {
            return option.category.indexOf(value) >= 0 || option.categoryName.indexOf(value) >= 0;
        });
        if (newOptions.length > 0) {
            groups[0].options = newOptions;
            setTotalData(groups);
        } else {
            setTotalData([]);
        };
    };

    const handleChange = (option) => {
        // 本地没有数据 构造本地数据结构
        if (localArrRef.current.length === 0) {
            localArrRef.current = [{
                label: '历史选择记录',
                disabled: true,
                options: [
                    {
                        id: option.value,
                        category: option.originOption,
                        categoryName: option.label.props.children[1].props.children.props.children ? option.label.props.children[1].props.children.props.children : ''
                    }
                ]
            }];
        } else {
            let flag = false;//默认本地历史记录不存在当前选择记录
            let index;
            localArrRef.current[0].options.map((item, i) => {
                if (item.category === option.originOption){
                    index = i;
                    flag = true;
                }
            });
            if (!flag && localArrRef.current[0].options.length >= LOCALARR_LIMIT) {
                localArrRef.current[0].options.pop();
            } else {
                if (flag) {
                    localArrRef.current[0].options.splice(index, 1);
                };
            };
            localArrRef.current[0].options.unshift({
                id: option.value,
                category: option.originOption,
                categoryName: option.label.props.children[1].props.children.props.children ? option.label.props.children[1].props.children.props.children : ''
            });
        };
        localStorage.setItem(localStorageName, JSON.stringify(localArrRef.current));
        setValue(option.value);
        handleChangeCallback(option.value);
    };

    useImperativeHandle(ref, () => ({
        updataOption() {
            if (localArrRef.current.length > 0) {
                const id = localArrRef.current[0].options[0].id;
                setValue(id);
            } else {
                const id = data[0]?.id;
                setValue(id);
            }
        },
        value,
        setValue
    }))

    return(
        <>
            <Select
                filterable
                clearable={false}
                onFilter={handleFilter}
                onChange={handleChange}
                onFocus={handleSetData}
                onBlur={handleSetData}
                style={{width:427}}
                value={value}
                >
                {totalData.map((group, index) => (
                    <Select.OptionGroup key={index} label={group.label} >
                    {group.options.map((option, index) => (
                        <Select.Option key={index} value={option.id} originOption={option.category}>
                            <div style={{display:'flex',justifyContent:'space-between'}}>
                                <div style={{width:'70%',maxWidth:'275px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                    <Tooltip message={option.category}>
                                        {option.category}
                                    </Tooltip>
                                </div>
                                <div style={{width:'30%',maxWidth:'115px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'right'}}>
                                    <Tooltip message={option.categoryName}>
                                        {option.categoryName}
                                    </Tooltip>
                                </div>
                            </div>
                        </Select.Option>
                    ))}
                    </Select.OptionGroup>
                ))}
            </Select>
        </>
    )
}

export default forwardRef(LocalSelect);