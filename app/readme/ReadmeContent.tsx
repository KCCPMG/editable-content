

export default function readmeContent() {
  return (
    <>
      <h1 id="editablecontent">EditableContent</h1>
      <p>EditableContent is a collection of components and context to give developers the ability to create limited rich-text editors, including React components to wrap text. At a high level, there are four basic components:</p>
      <ul>
        <li>An <code>EditableContentContextProvider</code>, which must be an ancestor to the other components.</li>
        <li>An <code>EditableContent</code> component in which a user can write, delete, and edit text</li>
        <li>One or more <code>EditTextButton</code> components, which provide the ability to add, remove, and break text wrappers within an <code>EditableContent</code> component</li>
        <li>A <code>RenderedContent</code> component, which is a non-editable version of <code>EditableContent</code></li>
      </ul>
      <p>Only one <code>EditableContent</code> or <code>RenderedContent</code> should be rendered at a time per instance of <code>EditableContentContextProvider</code>.</p>
      <p>How to use:</p>
      <h2 id="editablecontentcontextprovider">EditableContentContextProvider</h2>
      <p>The <code>EditableContentContextProvider</code> <em>must</em> be rendered as an ancestor to the EditableContent component. It takes only one prop (see Defining Your Own Wrappers) and will hold all the relevant state that the <code>EditableContent</code> and <code>RenderedContent</code> depend on. <code>EditableContentContextProvider</code> takes four props:</p>
      <ul>
        <li><code>children</code>: ReactNode, standard use of children in a React context</li>
        <li><code>keyAndWrapperObjs</code>: An array of type <code>KeyAndWrapperObj</code>, which are the options for a user to wrap their text with. See &quot;Defining Your Own React Component Wrappers&quot; below</li>
        <li><code>initialHTML</code>: (optional) string, which will be the HTML which initially populates an <code>EditableContent</code> or <code>RenderedContent</code> instance </li>
      </ul>
      <h3 id="populating-wrappers">Populating wrappers</h3>
      <p>A <code>KeyAndWrapperObj</code> is an object to be defined which will correspond to a text wrapper
        To make a wrapper available to your provider, it must be passed to the EditableContentContext in the prop <code>keyAndWrapperObjs</code>. This prop takes an array of objects, each of which represents a wrapper and has two key/value pairs:</p>
      <pre>
        <code>
          <span>type</span>
          <span>KeyAndWrapperObj</span>
          = \&lbrace;
          dataKey: string
          wrapper: <span>React</span>.
          <span>ReactElement</span>,
          \&rbrace;
        </code></pre><p>In order to function properly, the value passed to <code>dataKey</code> must be unique among the objects in the array. Because the <code>wrapper</code> value must be a React.ReactElement, note that this can be either a functional React component or a simple (not nested) html wrapper. As for what is necessary for React wrappers, more on that next.</p>
      <h3 id="defining-your-own-react-component-wrappers">Defining Your Own React Component Wrappers</h3>
      <p>As a part of the rendering process, there are several props which will be passed to each React wrapper automatically, and should be included in the Type definition of your wrapper&#39;s Props. Those props are the following:</p>
      <ul>
        <li><code>portalId</code>: the id of the portal to which the wrapper will be appended</li>
        <li><code>getContext</code>: a function which will safely return the result of <code>useEditableContentContext</code>. <ul>
          <li><strong>IMPORTANT:</strong> Do NOT call <code>useEditableContentContext</code> in the body of your wrapper. Because wrappers are passed as props to the <code>EditableContentContextProvider</code>, they do not <em>initially</em> render as descendants of <code>EditableContentContextProvider</code>, and as such, this will cause an error. Call <code>getContext</code> instead. (For more on this issue, see &quot;A Note On Contexts Used By Wrappers&quot; below)</li>
        </ul>
        </li>
        <li><code>children</code>: ReactNode, standard use of children in a React context</li>
      </ul>
      <p>When declaring the PropTypes for your wrappers, make sure that any of these values which you wish to access are declared as optional. Inside the component, make sure that any access of these props is conditional. When declaring your PropTypes, you should include the following:</p>
      <ul>
        <li><code>portalId?: string</code></li>
        <li><code>getContext?: () =&gt; EditableContentContextType</code> a function which will be passed to your rendered wrapper automatically and will return the EditableContentContextProvider&#39;s value (more on that later)</li>
        <li><code>children?: React.ReactNode</code></li>
      </ul>
      <h4 id="marking-content-for-exclusion">Marking Content for Exclusion</h4>
      <p>When you &#39;unwrap&#39; text from a React component, the process that is happening is that all of the text of that component is being extracted, the component is deleted, and then the text is put back in its correct place. For most purposes, this is fine for a text decoration, but there may be times where your React component aims to add text as part of the React component itself. For example, if you have a React component meant for a user to decree that text in a certain place is a name, you might have the following set of actions for a hypothetical app:</p>
      <ul>
        <li><p>A user types some text &#39;Alan Turing&#39; into an <code>EditableContent</code> component</p>
        </li>
        <li><p>The user, following the logic flow of the app, wants to indicate that this is a name</p>
        </li>
        <li><p>The user selects the text &#39;Alan Turing&#39; and then clicks the &#39;NAME&#39; <code>EditTextButton</code></p>
        </li>
        <li><p>Clicking the button creates a React component which puts &#39;Alan Turing&#39; into a div, but also adds the preceding text &#39;NAME:&#39;, so the total text content of the React component is now &#39;NAME: Alan Turing&#39;</p>
        </li>
        <li><p>The user decides they are done with the text, so they click a button which removes the <code>EditableContent</code> instance and replaces it with a <code>RenderedContent</code> instance. The React component&#39;s text is removed, the component is destroyed, and then the component is re-rendered in the <code>RenderedContent</code> instance. However, because the component is rendering the text &#39;NAME&#39; as a precedent to the text that it will receive, the full text of the component will now be &#39;NAME: NAME: Alan Turing&#39;</p>
        </li>
      </ul>
      <p>-OR-</p>
      <ul>
        <li>If instead of rendering the text, the user instead decides they made a mistake and click the &#39;NAME&#39; button again to remove the decoration, the React component will be removed, but the text &#39;NAME: Alan Turing&#39; will then be rendered as plain text in its place.</li>
      </ul>
      <p>This is obviously undesired behavior, but the <code>EditableContentContextProvider</code> can check for content which it should not &quot;count&quot; when it is removing a React component. The solution is that any html element which contains content which should not be factored in should be given the &#39;data-exclude-from-dehydrated&#39; attribute. This is also exported from <code>utils/constants</code> as <code>EXCLUDE_FROM_DEHYDRATED</code>. Here is an example from the <code>PropfulBox</code> component in the demo site&#39;s &quot;Propful Only&quot; example:</p>
      <pre><code><span className="xml">return (
        <span className="hljs-tag">&lt;<span className="hljs-name">Box</span>
          <span className="hljs-attr">onClick</span>=</span></span><span className="hljs-template-variable">&lbrace;increaseClicks&rbrace;</span><span className="xml"><span className="hljs-tag">
          </span></span><span className="hljs-template-variable">&lbrace;...rest&rbrace;</span><span className="xml"><span className="hljs-tag">
            &gt;</span>
          <span className="hljs-tag">&lt;<span className="hljs-name">span</span>
          </span></span><span className="hljs-template-variable">&lbrace;...&lbrace; [EXCLUDE_FROM_DEHYDRATED]: "" &rbrace;</span><span className="xml"><span className="hljs-tag">&rbrace;
            &gt;</span>
        </span><span className="hljs-template-variable">&lbrace;clickCount&rbrace;</span><span className="xml">&amp;nbsp;
          <span className="hljs-tag">&lt;/<span className="hljs-name">span</span>&gt;</span>
        </span><span className="hljs-template-variable">&lbrace;children&rbrace;</span><span className="xml">
          <span className="hljs-tag">&lt;/<span className="hljs-name">Box</span>&gt;</span>
          )</span>
      </code></pre><p>In this example, the clickCount is increased from clicking on the box and is rendered dynamically, but rendering the text or unwrapping the text from the React component will <em>not</em> cause the clickCount to be rendered as text.</p>
      <h4 id="a-note-on-contexts-used-by-wrappers">A Note On Contexts Used By Wrappers</h4>
      <p>When a wrapper is passed to the <code>keyAndWrapperObjs</code> array it is initially called as a function at that level, meaning it will not have initially have access to any context which is a descendent of the <code>EditableContentContextWrapper</code>. </p>
      <p>For example: </p>
      <pre><code><span className="hljs-function"><span className="hljs-keyword">function</span> <span className="hljs-title">MyWrapper</span>(<span className="hljs-params"></span>) </span>&lbrace;
        <span className="hljs-keyword">const</span> &lbrace;myContextValue&rbrace; = useContext(MyContext)
        &rbrace;

        &lt;EditableContentContextProvider
        keyAndWrapperObjs=&lbrace;[
        dataKey: <span className="hljs-string">"my-wrapper"</span>,
        <span className="hljs-attr">wrapper</span>: <span className="xml"><span className="hljs-tag">&lt;<span className="hljs-name">MyWrapper</span> /&gt;</span>
          ]&rbrace;
          &gt;
          <span className="hljs-tag">&lt;<span className="hljs-name">MyContextProvider</span>&gt;</span>
          <span className="hljs-tag">&lt;<span className="hljs-name">EditableContent</span> /&gt;</span>
          <span className="hljs-tag">&lt;/<span className="hljs-name">MyContextProvider</span>&gt;</span>
          <span className="hljs-tag">&lt;/<span className="hljs-name">EditableContentContextProvider</span>&gt;</span></span>
      </code></pre><p>This will fail, because even though <code>MyWrapper</code> will only truly be rendered to the DOM within the <code>EditableContent</code>, which itself is within <code>MyContextProvider</code>, the initial call of the function is <em>outside</em> the scope of <code>MyContextProvider</code></p>
      <p>In order to use context, you can do one of two things. The first of which is to make all calls to context safe by using default destructuring logic, as below: </p>
      <pre><code><span className="hljs-function"><span className="hljs-keyword">function</span> <span className="hljs-title">MyWrapper</span><span className="hljs-params">()</span> </span>&lbrace;
        <span className="hljs-keyword">const</span> &lbrace;myContextValue = <span className="hljs-number">0</span>&rbrace; = useContext(MyContext)
        &rbrace;
      </code></pre><p>The second possible option is to simply change the order in which the context providers render, so that <code>MyWrapper</code> is called within the scope of <code>MyContextProvider</code> from the beginning:</p>
      <pre><code><span className="hljs-function"><span className="hljs-keyword">function</span> <span className="hljs-title">MyWrapper</span>(<span className="hljs-params"></span>) </span>&lbrace;
        <span className="hljs-keyword">const</span> &lbrace;myContextValue&rbrace; = useContext(MyContext)
        &rbrace;

        &lt;MyContextProvider&gt;
        <span className="xml"><span className="hljs-tag">&lt;<span className="hljs-name">EditableContentContextProvider</span>
          <span className="hljs-attr">keyAndWrapperObjs</span>=<span className="hljs-string">&lbrace;[</span>
          <span className="hljs-attr">dataKey:</span> "<span className="hljs-attr">my-wrapper</span>",
          <span className="hljs-attr">wrapper:</span> &lt;<span className="hljs-attr">MyWrapper</span> /&gt;</span>
          ]&rbrace;
          &gt;
          <span className="hljs-tag">&lt;<span className="hljs-name">EditTextButton</span> <span className="hljs-attr">dataKey</span>=<span className="hljs-string">"my-wrapper"</span>&gt;</span>
          MW
          <span className="hljs-tag">&lt;/<span className="hljs-name">EditTextButton</span>&gt;</span>
          <span className="hljs-tag">&lt;<span className="hljs-name">EditableContent</span> /&gt;</span>
          <span className="hljs-tag">&lt;/<span className="hljs-name">EditableContentContextProvider</span>&gt;</span></span>
        &lt;<span className="hljs-regexp">/MyContextProvider&gt;</span>
      </code></pre><h3 id="useeditablecontentcontext">useEditableContentContext</h3>
      <p><code>useEditableContentContext</code> is a simple custom hook which exposes the context at work in the EditableContentContextProvider component, and is the same hook which is used by the EditableContent component itself. If <code>useEditableContentContext</code> is not found at the time that it is called, it will throw an error. For that reason, it must not be used in your wrappers (as per &quot;A Note on Contexts Used By Wrappers&quot; above). However, this context can be consumed within your wrappers by using the <code>getContext</code> function.</p>
      <p>Additionally, there may be other components you may wish to use within the scope of <code>EditableContentContextProvider</code> for the purposes of viewing or extracting data from the Provider. For example, you may wish to extract the dehydratedHTML for the purposes of processing, saving to a database, sending in an API request, etc.</p>
      <p>The following are the properties which can be extracted from <code>useEditableContentContext</code></p>
      <ul>
        <li>contextInstanceIdRef: MutableRefObject\&lt;string&rt;<ul>
          <li>This is a ref, the current value of which is a unique string which ties together the Provider with EditTextButtons and EditableContent to keep the <code>hasSelection</code> state from being set to false when an <code>EditTextButton</code> is clicked corresponding to that Provider. Note that there are known issues with this in strict mode/development NODE_ENV, see &quot;Known Issues&quot; below. </li>
        </ul>
        </li>
        <li>contentRef: MutableRefObject&lt;HTMLDivElement | null&rt;<ul>
          <li>The contentRef is a ref object which corresponds to the <code>EditableContent</code> or <code>RenderedContent</code> div which is being rendered to the DOM. This assignment is handled automatically by those components, and is one of several reasons why only one instance of <code>EditableContent</code> or <code>RenderedContent</code> should ever be rendered per <code>EditableContentContextProvider</code> at a time.</li>
        </ul>
        </li>
        <li>contentRefCurrentInnerHTML: string<ul>
          <li>Stringified HTML representing the content of the <code>EditableContent</code> or <code>RenderedContent</code> div, and should update on all changes.</li>
        </ul>
        </li>
        <li>setContentRefCurrentInnerHTML: Dispatch&lt;SetStateAction&lt;string&gt;&gt;<ul>
          <li>The setter for contentRefCurrentInnerHTML and can be accessed directly, but is also called by <code>EditableContent</code> or <code>RenderedContent</code> naturally as the HTML is changed (by user input or hydration of React components).</li>
        </ul>
        </li>
        <li>selectionToString: string<ul>
          <li>If the window&#39;s selection is inside of the contentRef, this is the textContent (no markup) of the selection.</li>
        </ul>
        </li>
        <li>setSelectionToString: Dispatch&lt;SetStateAction&lt;string&gt;&gt;<ul>
          <li>The setter for selectionToString, which is called when a selection is made within the <code>EditableContent</code> div.</li>
        </ul>
        </li>
        <li>selectionAnchorNode: Node | null<ul>
          <li>When the selection is within the <code>EditableContent</code> div, this is the selection&#39;s anchor node. This is primarily used internally to trigger state updates when the selection changes.</li>
        </ul>
        </li>
        <li>setSelectionAnchorNode: Dispatch&lt;SetStateAction&lt;Node | null&gt;&gt;<ul>
          <li>Setter for the selection anchor node, called automatically by a &#39;selectionchange&#39; handler assigned to the document when <code>EditableContent</code> is rendered.</li>
        </ul>
        </li>
        <li>selectionAnchorOffset: number | null<ul>
          <li>When the selection is within the <code>EditableContent</code> div, this is the selection&#39;s anchor offset. This is primarily used internally to trigger state updates when the selection changes.</li>
        </ul>
        </li>
        <li>setSelectionAnchorOffset: Dispatch&lt;SetStateAction&lt;number | null&gt;&gt;<ul>
          <li>Setter for the selection anchor offset, called automatically by a &#39;selectionchange&#39; handler assigned to the document when <code>EditableContent</code> is rendered.</li>
        </ul>
        </li>
        <li>selectionFocusNode: Node | null <ul>
          <li>When the selection is within the <code>EditableContent</code> div, this is the selection&#39;s focus node. This is primarily used internally to trigger state updates when the selection changes.</li>
        </ul>
        </li>
        <li>setSelectionFocusNode: Dispatch&lt;SetStateAction&lt;Node | null&gt;&gt;<ul>
          <li>Setter for the selection focus node, called automatically by a &#39;selectionchange&#39; handler assigned to the document when <code>EditableContent</code> is rendered.</li>
        </ul>
        </li>
        <li>selectionFocusOffset: number | null<ul>
          <li>When the selection is within the <code>EditableContent</code> div, this is the selection&#39;s focus offset. This is primarily used internally to trigger state updates when the selection changes.</li>
        </ul>
        </li>
        <li>setSelectionFocusOffset: Dispatch&lt;SetStateAction&lt;number | null&gt;&gt;<ul>
          <li>When the selection is within the <code>EditableContent</code> div, this is the selection&#39;s focus offset. This is primarily used internally to trigger state updates when the selection changes.</li>
        </ul>
        </li>
        <li>hasSelection: boolean,<ul>
          <li>A boolean representing if the window&#39;s selection is within the <code>EditableContent</code> div.</li>
        </ul>
        </li>
        <li>setHasSelection: Dispatch&lt;SetStateAction&lt;boolean&gt;&gt;<ul>
          <li>The setter for hasSelection, which is called when the the contentRef&#39;s focus and blur events fire.</li>
        </ul>
        </li>
        <li>portals: Array&lt;ReactPortal&gt;<ul>
          <li>This is the array of ReactPortals which are appended to specific divs in the contentRef. These ReactPortals are directly rendered into the contentRef, and each portal has a key (referred to as the portalId) which is the unique id of the portal.</li>
        </ul>
        </li>
        <li>
          setPortals: Dispatch&lt;SetStateAction&lt;Array&lt;ReactPortal&gt;&gt;&gt;
          <ul>
            <li>This is the setter for portals and is called directly only in <code>EditableContentContextProvider</code>, but is also called in other functions which are included in <code>EditableContentContext</code>.</li>
          </ul>
        </li>
        <li>divToSetSelectionTo: HTMLElement | null<ul>
          <li>This is a div within the <code>EditableContent</code> div that should be selected by <code>window.getSelection()</code> and represents a div which has a portal appended to it.</li>
        </ul>
        </li>
        <li>setDivToSetSelectionTo: Dispatch&lt;SetStateAction&lt;HTMLElement | null&gt;&gt;<ul>
          <li>The setter for <code>divToSetSelectionTo</code> which is called inside of the <code>createContentPortal</code> function in <code>EditableContentContextProvider</code>.</li>
        </ul>
        </li>
        <li>prepareDehydratedHTML: (callback: (dehydratedHTML: string) =&gt; void) =&gt; void<ul>
          <li>This is a helper function which takes the <code>contentRefCurrentInnerHTML</code> and converts it into dehydrated html (all html from added by React component renders removed), and then passes the dehydrated html to a callback taken as an argument. Internally, this is used to keep <code>dehydratedHTML</code> up to date by calling <code>prepareDehydratedHTML(setDehydratedHTML)</code> whenever the <code>contentRefCurrentInnerHTML</code> is changed. Generally, using <code>dehydratedHTML</code> directly will likely suit your purposes. </li>
        </ul>
        </li>
        <li>updatePortalProps: (updateObj: PortalProps) =&gt; void<ul>
          <li>This is a function for updating one or more props passed to the portals rendered in <code>EditableContent</code> or <code>RenderedContent</code>. The function takes an <code>updateObj</code> of which each key corresponds to a portalId, and the value is an object of props with new values. Each specified portalId will have its portal in <code>portals</code> replaced with a clone of itself with the new values for any prop(s) specified. Portals which are not specified with a portalId will not be changed, and portals which are being changed do not need all props to be specified, the only changes that will be made will be the ones to explicitly included props.</li>
        </ul>
        </li>
        <li>getAllPortalProps: () =&gt; PortalProps<ul>
          <li>Goes through the portals state and returns an object where the key is the portalId of a portal and the value is an object containing all props.</li>
        </ul>
        </li>
        <li>keyAndWrapperObjs: Array&lt;KeyAndWrapperObj&gt;<ul>
          <li>This is the same as the prop which is passed to <code>EditableContentContextProvider</code>.</li>
        </ul>
        </li>
        <li>updateContent: () =&gt; void<ul>
          <li>A function for re-formatting <code>contentRef.current</code> the div to keep it consistent with regard to text nodes, cleaning up empty elements, resetting the selection, passing the re-formatted HTML to <code>setContentRefCurrentInnerHTML</code>, and then re-establishing focus on <code>contentRef.current</code>.</li>
        </ul>
        </li>
        <li>createContentPortal: (component: ReactElement, buttonKey: string) =&gt; string | undefined<ul>
          <li>A function which creates a portalId, a div which will house a ReactPortal, a ReactPortal for the passed in component, and extracts any selected text to be passed as a child to the component. </li>
        </ul>
        </li>
        <li>appendPortalToDiv: (containingDiv: HTMLDivElement) =&gt; void<ul>
          <li>A function which creates a React component and the ReactPortal which it will belong to, extracts the text from the containingDiv and passes it to the component, and attaches the ReactPortal to the containingDiv.</li>
        </ul>
        </li>
        <li>removePortal: (key: string) =&gt; void<ul>
          <li>Given a key, finds the portal with that portalId and removes it from portals.</li>
        </ul>
        </li>
        <li>updateSelection: () =&gt; void<ul>
          <li>Resets the scroll of the <code>contentRef.current</code> div, gets the current selection, and if it is within <code>contentRef.current</code>, resets all of the state related to the selection.</li>
        </ul>
        </li>
        <li>dehydratedHTML: string<ul>
          <li>The inner HTML of <code>contentRef.current</code> stripped of all content which is marked as needing to be excluded from dehydrated, as well as all non-text nodes within a portal containing div. This is effectively the HTML with all React markup removed.</li>
        </ul>
        </li>
        <li>resetPortalContainers: () =&gt; void<ul>
          <li>This function resets the portals by extracting the text from the portal containing divs, passing it to the cloned components and reestablishing the portals with their containing divs. This is used in both <code>EditableContent</code> and <code>RenderedContent</code> to hydrate with React when the portals state is already populated.</li>
        </ul>
        </li>
        <li>assignContentRef: (newRef: null | HTMLDivElement) =&gt; void<ul>
          <li>This function assigns <code>contentRef.current</code> to the div which belongs to either <code>EditableContent</code> or <code>RenderedContent</code>.</li>
        </ul>
        </li>
        <li>buttonUpdateTrigger: boolean<ul>
          <li>A boolean that is triggered when a button is clicked, simply to force the <code>EditableContentContext</code> to update its state. This may be removed in later updates.</li>
        </ul>
        </li>
        <li>triggerButtonUpdate: () =&gt; void<ul>
          <li>Flips the value of <code>buttonUpdateTrigger</code> to force a state update. This may be removed in later updates.</li>
        </ul>
        </li>
      </ul>
      <h2 id="editablecontent">EditableContent</h2>
      <p><code>EditableContent</code> is the component which houses the actual &#39;contenteditable&#39; div. It takes only two props, both of which are optional:</p>
      <ul>
        <li>className: string<ul>
          <li>The className which will be passed to the div for any desired CSS styling. This is especially useful for determining scroll behavior.</li>
        </ul>
        </li>
        <li>disableNewLines: boolean<ul>
          <li>If disableNewLines is true, pressing &#39;Enter&#39; will prevent the default behavior of creating a <code>&lt;br/&gt;</code> element to add a new line in the div. This is useful for creating <code>&lt;input&gt;</code>-like fields which do not extend beyond one line.</li>
        </ul>
        </li>
      </ul>
      <p>The <code>EditableContent</code> component does not require anything beyond these props and being placed within the scope of a <code>EditableContentContextProvider</code>. Selection changes, portal hydration, etc. are handled internally. </p>
      <h3 id="a-note-on-editablecontent-rendering">A Note on EditableContent Rendering</h3>
      <p><code>EditableContent</code> makes significant usage of <code>useEffect</code> to populate and update its text content, the selection, and React components. Because of the logic which operates directly on the DOM, &#39;strict mode&#39; double-renders can cause DOM-modifying logic to restart before it&#39;s finished and functionally delete content. To counter this, there is a check within <code>EditableContent</code> to look at <code>process.env.NODE_ENV</code>, and if it is set to &quot;development&quot;, the order of <code>useEffect</code> operations is altered to allow for the initial render to completely finish (both calls) before resuming the <code>useEffect</code> logic related to portals.</p>
      <h2 id="renderedcontent">RenderedContent</h2>
      <p><code>RenderedContent</code> is effectively a pared-down version of <code>EditableContent</code>, because it renders the same way but has no logic for keyboard inputs or selection changes. It takes only one prop, which is optional:</p>
      <ul>
        <li>className: string<ul>
          <li>The className which will be passed to the div for any desired CSS styling. This is especially useful for determining scroll behavior.</li>
        </ul>
        </li>
      </ul>
      <p><code>RenderedContent</code> is affected by the same logic as <code>EditableContent</code> when it comes to renders, see &quot;A Note on EditableContent Rendering&quot; above.</p>
      <h2 id="edittextbutton">EditTextButton</h2>
      <p><code>EditTextButton</code> is the control used for wrapping and unwrapping selected text. Before getting into the component logic, it&#39;s important to understand how these buttons behave.</p>
      <h3 id="basic-rules-for-edittextbutton-behavior">Basic Rules for EditTextButton behavior</h3>
      <ul>
        <li><p>Each <code>EditTextButton</code> keeps track of the ReactElement wrapper to which it is assigned. </p>
        </li>
        <li><p>Each <code>EditTextButton</code> keep track of a query which corresponds to the ReactElement, the most significant part of which is the <code>data-bk</code> attribute.</p>
        </li>
        <li><p>If <em>all</em> of the text in a selection is a descendant of one or more elements which match the query, the text is considered selected. If <em>none or only some of the text</em> in a selection matches the query, the text is not considered selected.</p>
        </li>
        <li><p>If the text is considered selected, the button will appear to be clicked. If the text is not considered selected, the button will not appear clicked.</p>
        </li>
        <li><p>If the focus is outside of the <code>EditableContent</code> or the selected text may not be clicked (for example it is inside of an unbreakable element), the button will be <strong>disabled</strong>.</p>
        </li>
        <li><p>If a button is not clicked, clicking it will first remove all elements matching the query in the selection, then will wrap the entire selection in a newly created element.</p>
        </li>
        <li><p>If a button is already clicked, clicking it will break up the surrounding element such that the selection will no longer be a part of an element which matches the query.</p>
        </li>
      </ul>
      <h3 id="special-rules-for-unbreakable-elements">Special Rules for Unbreakable elements</h3>
      <p>If an element is unbreakable, either because it is specifically declared as being unbreakable or it is a React component, the button will have slightly different behavior in some scenarios.</p>
      <ul>
        <li><p>No other element can exist within an unbreakable element, meaning that if the selection is within an unbreakable element, every <code>EditTextButton</code> will be disabled, except for the one pertaining to that element. This also means that if the selection includes <em>any</em> element in whole or in part, the <code>EditTextButton</code> for an unbreakable component will be disabled.</p>
        </li>
        <li><p>If a selection is partially in an unbreakable element and partially outside of it, the <code>EditTextButton</code> for the unbreakable element will also be disabled.</p>
        </li>
        <li><p>If a selection is inside of an unbreakable element, clicking the <code>EditTextButton</code> will <strong>make the entire wrapper disappear</strong>, and in the case of a React component, will delete the component and remove it from <code>portals</code>. The one exception to this is below.</p>
        </li>
        <li><p>If a selection is inside of an unbreakable element and the cursor is collapsed and at the end of the text inside of the element, clicking the button will not affect the wrapper, but will move the cursor to the next available space after the wrapper. This is meant to intuitively follow as best as possible clicking a button to start a text style, then after finishing typing what should be in that style, &quot;turning the style off&quot; and continuing normally.</p>
        </li>
      </ul>
      <h3 id="edittextbutton-props">EditTextButton props</h3>
      <p>The <code>EditTextButton</code>, in addition to the props below, accepts any props from MaterialUI&#39;s <code>ButtonOwnProps</code> (except for &#39;color&#39;), as well as any props from <code>React.ComponentPropsWithoutRef&lt;&#39;button&#39;&gt;</code>. All of these props will be passed automatically to the Button/button. Here are the additional explicit props:</p>
      <ul>
        <li>isMUIButton: boolean<ul>
          <li>If this is set to true, <code>EditTextButton</code> will render as its base an MUI <code>Button</code> component instead of a plain <code>&lt;button&gt;</code>.</li>
        </ul>
        </li>
        <li>dataKey: string<ul>
          <li>This is the key which must be the same as in one of the objects in the <code>KeyAndWrapperObj</code> which is passed as a prop to <code>EditableContentContextProvider</code>. This key is responsible for telling <code>EditTextButton</code> which wrapper it is responsible for assigning/removing.</li>
        </ul>
        </li>
        <li>children?: ReactNode<ul>
          <li>The children of the button, ideally short text or an icon.</li>
        </ul>
        </li>
        <li>selectedVariant?: ButtonOwnProps[&quot;variant&quot;]<ul>
          <li>An optional prop for use if <code>isMUIButton</code> is set to true. This will be the MUI variant the button takes on when the button is selected.</li>
        </ul>
        </li>
        <li>deselectedVariant?: ButtonOwnProps[&quot;variant&quot;]<ul>
          <li>An optional prop for use if <code>isMUIButton</code> is set to true. This will be the MUI variant the button takes on when the button is deselected.</li>
        </ul>
        </li>
        <li>selectCallback?: htmlSelectCallback | reactSelectCallback<ul>
          <li>A function which will fire when the <code>EditTextButton</code> is clicked to become selected, to which the wrapper will be passed. If the wrapper is a React component, the portalId will be the second parameter passed to the function.</li>
        </ul>
        </li>
        <li>deselectCallback?: () =&gt; void | undefined<ul>
          <li>A function which will fire when the <code>EditTextButton</code> is clicked to make text deselected. This function is not passed any argument.</li>
        </ul>
        </li>
      </ul>
      <h2 id="browser-behavior-and-text">Browser Behavior and Text</h2>
      <p>By default, browsers take certain actions in managing spaces and cursor placement, sometimes creating undesirable behavior. For example, typing in a given element, unwrapping the element, and then hitting the space bar would give the user an expectation of continuing to write in plain text from that point. However, Chrome will prevent this, because this would mean a new Text Node beginning with a space, which Chrome assumes is wrong, and so Chrome would extend the wrapper element over the cursor that the user just tried to break out of the previous wrapper.</p>
      <p>As a result, a great deal of default behavior in using a contenteditable div has been overridden here.</p>
      <ul>
        <li>Pressing the spacebar will create a non-breaking space rather than a traditional space.</li>
        <li>Elements are padded with zero-width spaces so that the first and last character of text inside of any given element should both be zero-width spaces. These are being constantly managed by the processes involved in wrapping, unwrapping, and cleaning up text. Accordingly, these should not require any action from you in terms of getting these components to work correctly, but may require attention depending on how the actual content will be used in other parts of your application.</li>
      </ul>
      <h2 id="known-issues">Known Issues</h2>
      <ul>
        <li>Undo<ul>
          <li>Undoing (Ctrl+Z / Cmd+Z) does not work as desired as virtually all keyboard inputs invoke e.preventDefault, which among other things, prevents those inputs from being added to the browser&#39;s undo cache.</li>
          <li>In order to address this, it will likely be necessary to create a separate cache relative to each instance of EditableContent or EditableContentContextProvider</li>
        </ul>
        </li>
        <li><code>data-context-id</code> assignment error in development mode<ul>
          <li>Upon loading in dev mode, an error is generated: <code>Warning: Prop `data-context-id` did not match. Server: &quot;some-uuid-value&quot; Client: &quot;some-other-uuid-value&quot;.</code> It is unclear why this error is occurring, but it does not happen in the build mode</li>
          <li>Additionally unknown at the time is why clicking a button does not set the <code>hasSelection</code> state to false, given that the <code>data-context-id</code> does not match the <code>contextInstanceIdRef.current</code> in strict/development mode, and this should result in a call to <code>setHasSelection(false)</code>.</li>
        </ul>
        </li>
      </ul>
    </>
  )
}