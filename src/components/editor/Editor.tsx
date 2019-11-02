import React from 'react';
import cx from 'classnames';
import * as copy from 'copy-to-clipboard';
import {
  convertToRaw,
  CompositeDecorator,
  Editor,
  EditorState,
  RichUtils,
  ContentBlock,
  ContentState
} from 'draft-js';
import Icon from '../icon';
import Link from './Link';

import 'draft-js/dist/Draft.css';
import './editor.less';

function findLinkEntities(
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    return entityKey !== null && contentState.getEntity(entityKey).getType() === 'LINK';
  }, callback);
}

const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link
  }
]);

const BLOCK_TYPES = [
  { label: 'unorderedlist', style: 'unordered-list-item' },
  { label: 'orderedlist', style: 'ordered-list-item' }
];

const INLINE_STYLES = [
  { label: 'bold', style: 'BOLD' },
  { label: 'italic', style: 'ITALIC' },
  { label: 'underline', style: 'UNDERLINE' },
  { label: 'strikethrough', style: 'STRIKETHROUGH' }
];

function MyEditor() {
  const [editorState, setEditorState] = React.useState(EditorState.createEmpty(decorator));
  const [copied, setCopied] = React.useState(false);

  const handleKeyCommand = (command: string, editorState: EditorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const _onStyleClick = (type: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, type));
  };

  const _toggleBlockType = (blockType: string) => {
    setEditorState(RichUtils.toggleBlockType(editorState, blockType));
  };

  const handleGetContent = () => {
    console.log(editorState.getCurrentContent());
    console.log(convertToRaw(editorState.getCurrentContent()));
  };

  const handleCopy = () => {
    const text = editorState.getCurrentContent().getPlainText();
    const success = copy.default(text);
    console.log(success, 'handleCopy');
    setCopied(success);
  };

  const handleMouseLeave = () => {
    if (copied) {
      setCopied(false);
    }
  };
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="resumes-editor">
      <ul className="resumes-editor-header">
        {INLINE_STYLES.map(el => (
          <li
            className={cx('resumes-editor-header-item', {
              'resumes-editor-header-active': currentStyle.has(el.style)
            })}
            key={el.label}
            onClick={() => _onStyleClick(el.style)}
          >
            <Icon type={el.label} />
          </li>
        ))}
        {BLOCK_TYPES.map(el => (
          <li
            className="resumes-editor-header-item"
            key={el.label}
            onClick={() => _toggleBlockType(el.style)}
          >
            <Icon type={el.label} />
          </li>
        ))}
        <li
          className="resumes-editor-header-item"
          onClick={() => {
            const contentState = editorState.getCurrentContent();
            const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {
              url: 'http://www.baidu.com'
            });
            const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
            const newEditorState = EditorState.set(editorState, {
              currentContent: contentStateWithEntity
            });
            setEditorState(
              RichUtils.toggleLink(newEditorState, newEditorState.getSelection(), entityKey)
            );
          }}
        >
          <Icon type="link" />
        </li>
        <li
          className="resumes-editor-header-item"
          onClick={handleCopy}
          onMouseLeave={handleMouseLeave}
        >
          <Icon type={copied ? 'check' : 'file-copy'} />
        </li>
      </ul>
      <button onClick={handleGetContent}>content</button>
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={setEditorState}
      />
    </div>
  );
}

export default MyEditor;
