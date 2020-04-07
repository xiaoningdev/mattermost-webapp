// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {Client4} from 'mattermost-redux/client';
import {getCurrentTeamId} from 'mattermost-redux/selectors/entities/teams';

import store from 'stores/redux_store.jsx';

import * as UserAgent from 'utils/user_agent';

import Suggestion from './suggestion.jsx';
import Provider from './provider.jsx';

export class CommandSuggestion extends Suggestion {
    render() {
        const {item, isSelection} = this.props;

        let className = 'command';
        if (isSelection) {
            className += ' suggestion--selected';
        }

        return (
            <div
                className={className}
                onClick={this.handleClick}
                onMouseMove={this.handleMouseMove}
                {...Suggestion.baseProps}
            >
                <div className='command__title'>
                    {item.suggestion + ' ' + item.hint}
                </div>
                <div className='command__desc'>
                    {item.description}
                </div>
            </div>
        );
    }
}

export default class CommandProvider extends Provider {
    callback = () => {}; //eslint-disable-line no-empty-function

    handlePretextChanged(pretext, resultCallback) {
        this.callback = resultCallback;
        if (pretext.startsWith('/')) {
            const command = pretext.toLowerCase();
            Client4.getCommandAutocompleteSuggestionsList(command, getCurrentTeamId(store.getState())).then(
                (data) => {
                    const matches = [];
                    data.forEach((sug) => {
                        if (!UserAgent.isMobile()) {
                            matches.push({
                                suggestion: '/' + sug.Suggestion,
                                hint: sug.Hint,
                                description: sug.Description,
                            });
                        }
                    });

                    // pull out the suggested commands from the returned data
                    const terms = matches.map((suggestion) => suggestion.suggestion);

                    resultCallback({
                        matchedPretext: command,
                        terms,
                        items: matches,
                        component: CommandSuggestion,
                    });
                }
            ).catch(
                () => {} //eslint-disable-line no-empty-function
            );

            return true;
        }
        return false;
    }

    handleCompleteWord(term) {
        this.handlePretextChanged(term + ' ', this.callback);
    }
}
